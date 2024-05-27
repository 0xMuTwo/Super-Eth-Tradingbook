import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { Pool } from "pg";
import cors from "cors";
import { Server } from "ws";

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

  try {
    await client.query("BEGIN");
    const buyOrders = await client.query(
      "SELECT * FROM orders WHERE status = 'open' AND type = 'buy' ORDER BY price DESC, timestamp ASC"
    );

    const sellOrders = await client.query(
      "SELECT * FROM orders WHERE status = 'open' AND type = 'sell' ORDER BY price ASC, timestamp ASC"
    );

    let i = 0;
    let j = 0;
    while (i < buyOrders.rows.length && j < sellOrders.rows.length) {
      const buyOrder = buyOrders.rows[i];
      const sellOrder = sellOrders.rows[j];
      if (buyOrder.price >= sellOrder.price) {
        const tradeSize = Math.min(buyOrder.size, sellOrder.size);

        // Record instructions
        instructions.push({
          username: buyOrder.username,
          asset: "ETH",
          amount: tradeSize,
        });

        instructions.push({
          username: buyOrder.username,
          asset: "USDT",
          amount: -sellOrder.price * tradeSize,
        });

        instructions.push({
          username: sellOrder.username,
          asset: "ETH",
          amount: -tradeSize,
        });

        instructions.push({
          username: sellOrder.username,
          asset: "USDT",
          amount: sellOrder.price * tradeSize,
        });

        // Adjust sizes
        buyOrder.size -= tradeSize;
        sellOrder.size -= tradeSize;

        console.log(
          `Matched Order: Buy(${
            buyOrder.username
          }, ${tradeSize} ETH) with Sell(${sellOrder.username}, ${
            sellOrder.price * tradeSize
          } USDT)`
        );

        // Close the matched orders or adjust remaining size
        if (buyOrder.size === 0) {
          await client.query(
            "UPDATE orders SET status = 'closed' WHERE id = $1",
            [buyOrder.id]
          );

          i++;
        } else {
          await client.query("UPDATE orders SET size = $1 WHERE id = $2", [
            buyOrder.size,
            buyOrder.id,
          ]);
        }

        if (sellOrder.size === 0) {
          await client.query(
            "UPDATE orders SET status = 'closed' WHERE id = $1",
            [sellOrder.id]
          );
          j++;
        } else {
          await client.query("UPDATE orders SET size = $1 WHERE id = $2", [
            sellOrder.size,
            sellOrder.id,
          ]);
        }
      } else {
        j++;
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  const userBalances: { [key: string]: { [asset: string]: number } } = {};
  instructions.forEach(({ username, asset, amount }) => {
    if (!userBalances[username]) {
      userBalances[username] = {};
    }
    if (!userBalances[username][asset]) {
      userBalances[username][asset] = 0;
    }
    userBalances[username][asset] += amount;
  });

  const results = Object.entries(userBalances).map(([username, assets]) => ({
    username,
    assets,
  }));
  return results;
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
