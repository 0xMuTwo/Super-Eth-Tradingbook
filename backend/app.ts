import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { Pool } from "pg";
import cors from "cors";

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
    await matchOrders();
    res.status(200).send("Order matching completed successfully.");
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
  try {
    await client.query("BEGIN");
    const buyOrders = await client.query(
      "SELECT * FROM orders WHERE type = 'buy' AND status = 'open' ORDER BY price DESC, timestamp ASC FOR UPDATE"
    );
    const sellOrders = await client.query(
      "SELECT * FROM orders WHERE type = 'sell' AND status = 'open' ORDER BY price ASC, timestamp ASC FOR UPDATE"
    );

    for (let buyOrder of buyOrders.rows) {
      for (let sellOrder of sellOrders.rows) {
        if (
          buyOrder.price >= sellOrder.price &&
          buyOrder.status === "open" &&
          sellOrder.status === "open"
        ) {
          const tradeSize = Math.min(buyOrder.size, sellOrder.size);
          await client.query(
            "UPDATE orders SET size = size - $1, status = CASE WHEN size - $1 <= 0 THEN 'closed' ELSE 'open' END WHERE id = $2",
            [tradeSize, buyOrder.id]
          );

          await client.query(
            "UPDATE orders SET size = size - $1, status = CASE WHEN size - $1 <= 0 THEN 'closed' ELSE 'open' END WHERE id = $2",
            [tradeSize, sellOrder.id]
          );

          if (buyOrder.size <= tradeSize) break;
        }
      }
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

app
  .listen(PORT, () => {
    console.log("Server running at PORT:", PORT);
  })
  .on("error", (error: Error) => {
    console.error("Server error", error);
    throw new Error(error.message);
  });
