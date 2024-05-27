import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { Pool } from "pg";
import cors from "cors";
import { Server } from "ws";
interface Order {
  username: string;
  price: number;
  size: number;
  type: "buy" | "sell";
  status: "open" | "closed";
  id: number;
  timestamp: string;
}
const pool = new Pool({
  host: String(process.env.DB_HOST),
  user: String(process.env.DB_USER),
  password: String(process.env.DB_PASSWORD),
  database: String(process.env.DB_NAME),
  port: Number(process.env.DB_PORT),
});
async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT NOW()");
      console.log("Connected to database:", result.rows[0]);
    } finally {
      client.release();
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error connecting to the database", err.stack);
    } else {
      console.error("Error connecting to the database", err);
    }
  }
}
checkDatabaseConnection();
const app = express();
app.use(cors());
const PORT = process.env.BACKEND_PORT || 5001;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (request: Request, response: Response) => {
  console.log("Received request on root endpoint");
  response.status(200).send("Hello World");
});
app.get("/health", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT 1");
    if (result.rowCount === 1) {
      res.status(200).send("OK");
    } else {
      res.status(500).send("Database health check failed");
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error("Health check error", err);
    } else {
      console.error("Health check error", err);
    }
    res.status(500).send("Internal Server Error");
  }
});
app.get("/book", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orders WHERE status = 'open' ORDER BY price DESC, timestamp ASC"
    );
    console.log("/book called. Returning data...");
    res.status(200).json(result.rows);
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error fetching orders", err);
    } else {
      console.error("Error fetching orders", err);
    }
    res.status(500).send("Internal Server Error");
  }
});
app.delete("/delete-all", async (req: Request, res: Response) => {
  try {
    await pool.query("DELETE FROM orders");
    console.log("All orders deleted");
    // Notify all WebSocket clients about the deletion of all orders
    broadcastMessage({
      type: "deleteAll",
      message: "All orders have been deleted",
    });
    res.status(200).send("All orders have been deleted");
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error deleting all orders", err);
    } else {
      console.error("Error deleting all orders", err);
    }
    res.status(500).send("Internal Server Error");
  }
});
app.post(
  "/orders",
  [
    body("order").exists().withMessage("Order data is missing"),
    body("order.username").isString().withMessage("Username must be a string"),
    body("order.side")
      .isString()
      .withMessage("Side must be a string")
      .isIn(["buy", "sell"])
      .withMessage("Side must be 'buy' or 'sell'"),
    body("order.size").isNumeric().withMessage("Size must be a number"),
    body("order.price").isNumeric().withMessage("Price must be a number"),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, side, size, price } = req.body.order;
    try {
      const result = await pool.query(
        "INSERT INTO orders (username, price, size, type, status) VALUES ($1, $2, $3, $4, 'open') RETURNING *",
        [username, price, size, side]
      );
      console.log(`Orders Endpoint Hit. Inserting Order: ${username}`);
      // Notify all WebSocket clients about the new order
      broadcastMessage({ type: "newOrder", order: result.rows[0] });
      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error inserting order", err);
      } else {
        console.error("Error inserting order", err);
      }
      res.status(500).send("Internal Server Error");
    }
  }
);
app.post("/match", async (req: Request, res: Response) => {
  try {
    const matchResults = await matchOrders();
    // Notify all WebSocket clients about the order match results
    broadcastMessage({ type: "orderMatch", results: matchResults });
    res.status(200).json(matchResults);
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error matching orders", err);
    } else {
      console.error("Error matching orders", err);
    }
    res.status(500).send("Internal Server Error");
  }
});
async function matchOrders() {
  const client = await pool.connect();
  const instructions: Array<{
    username: string;
    asset: string;
    amount: number;
  }> = [];
  const orderBook = { buyOrders: [] as Order[], sellOrders: [] as Order[] };
  try {
    await client.query("BEGIN");
    // Fetch the buy and sell orders from the database
    const buyOrdersResult = await client.query(
      "SELECT * FROM orders WHERE status = 'open' AND type = 'buy' ORDER BY price DESC, timestamp ASC"
    );
    const sellOrdersResult = await client.query(
      "SELECT * FROM orders WHERE status = 'open' AND type = 'sell' ORDER BY price ASC, timestamp ASC"
    );
    let buyOrders = buyOrdersResult.rows as Order[];
    let sellOrders = sellOrdersResult.rows as Order[];
    // Log the initial state of the orders
    console.log("Initial Buy Orders:", JSON.stringify(buyOrders, null, 2));
    console.log("Initial Sell Orders:", JSON.stringify(sellOrders, null, 2));
    // Track updates to order sizes and statuses
    const orderUpdates: Array<{
      id: number;
      size: number;
      status?: "open" | "closed";
    }> = [];
    let i = 0,
      j = 0;
    while (i < buyOrders.length && j < sellOrders.length) {
      const buyOrder = buyOrders[i];
      const sellOrder = sellOrders[j];
      console.log(
        `Attempting to match Buy Order: ${JSON.stringify(
          buyOrder
        )} with Sell Order: ${JSON.stringify(sellOrder)}`
      );
      // Check if the buy order price is greater than or equal to the sell order price
      if (Number(buyOrder.price) >= Number(sellOrder.price)) {
        const tradeSize = Math.min(
          Number(buyOrder.size),
          Number(sellOrder.size)
        );
        const totalPrice = Number(sellOrder.price) * tradeSize;
        // Record trade instructions for updating balances
        instructions.push({
          username: buyOrder.username,
          asset: "ETH",
          amount: tradeSize,
        });
        instructions.push({
          username: buyOrder.username,
          asset: "USDT",
          amount: -totalPrice,
        });
        instructions.push({
          username: sellOrder.username,
          asset: "ETH",
          amount: -tradeSize,
        });
        instructions.push({
          username: sellOrder.username,
          asset: "USDT",
          amount: totalPrice,
        });
        // Log the matched trade
        console.log(
          `Matched Trade: Buy(${buyOrder.username}, ${tradeSize} ETH @ ${buyOrder.price}) with Sell(${sellOrder.username}, ${totalPrice} USDT)`
        );
        // Adjust order sizes
        buyOrder.size = buyOrder.size - tradeSize;
        sellOrder.size = sellOrder.size - tradeSize;
        // Log the updated sizes
        console.log(
          `Updated Buy Order Size: ${buyOrder.size}, Updated Sell Order Size: ${sellOrder.size}`
        );
        // Determine which orders are fully matched and update statuses
        if (Number(buyOrder.size) === 0) {
          orderUpdates.push({ id: buyOrder.id, size: 0, status: "closed" });
          i++;
        } else {
          orderUpdates.push({ id: buyOrder.id, size: Number(buyOrder.size) });
        }
        if (Number(sellOrder.size) === 0) {
          orderUpdates.push({ id: sellOrder.id, size: 0, status: "closed" });
          j++;
        } else {
          orderUpdates.push({ id: sellOrder.id, size: Number(sellOrder.size) });
        }
      } else {
        // No match possible, move to the next buy order or sell order
        j++;
      }
    }
    // Update the orders in the database
    for (const update of orderUpdates) {
      if (update.status === "closed") {
        await client.query(
          "UPDATE orders SET size = 0, status = 'closed' WHERE id = $1",
          [update.id]
        );
      } else {
        await client.query("UPDATE orders SET size = $1 WHERE id = $2", [
          update.size,
          update.id,
        ]);
      }
    }
    await client.query("COMMIT");
    // Fetch the state of the order book after matching
    const updatedBuyOrdersResult = await client.query(
      "SELECT * FROM orders WHERE status = 'open' AND type = 'buy' ORDER BY price DESC, timestamp ASC"
    );
    const updatedSellOrdersResult = await client.query(
      "SELECT * FROM orders WHERE status = 'open' AND type = 'sell' ORDER BY price ASC, timestamp ASC"
    );
    orderBook.buyOrders = updatedBuyOrdersResult.rows;
    orderBook.sellOrders = updatedSellOrdersResult.rows;
    // Log the final state of the orders
    console.log(
      "Final Buy Orders:",
      JSON.stringify(orderBook.buyOrders, null, 2)
    );
    console.log(
      "Final Sell Orders:",
      JSON.stringify(orderBook.sellOrders, null, 2)
    );
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error during order matching", err);
    throw err;
  } finally {
    client.release();
  }
  // Calculate user balances
  const userBalances: { [key: string]: { [asset: string]: number } } = {};
  for (const instruction of instructions) {
    const { username, asset, amount } = instruction;
    if (!userBalances[username]) {
      userBalances[username] = {};
    }
    if (!userBalances[username][asset]) {
      userBalances[username][asset] = 0;
    }
    userBalances[username][asset] += amount;
  }
  const userStates = Object.entries(userBalances).map(([username, assets]) => ({
    username,
    assets,
  }));
  return { userStates, orderBook };
}
const server = app
  .listen(PORT, () => {
    console.log("Server running at PORT:", PORT);
  })
  .on("error", (error: Error) => {
    console.error("Server error", error);
    throw new Error(error.message);
  });
const wss = new Server({ server });
wss.on("connection", (ws) => {
  console.log("New WebSocket client connected");
  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});
function broadcastMessage(message: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      // WebSocket's OPEN state
      client.send(JSON.stringify(message));
    }
  });
}
