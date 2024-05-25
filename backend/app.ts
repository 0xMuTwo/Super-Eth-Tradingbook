import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { Pool } from "pg";
// Configures dotenv to work in your application
dotenv.config();
// Create a new pool instance
const pool = new Pool({
  host: String(process.env.DB_HOST),
  user: String(process.env.DB_USER),
  password: String(process.env.DB_PASSWORD),
  database: String(process.env.DB_NAME),
  port: Number(process.env.DB_PORT),
});

// Async function to check the connection

async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT NOW()");
      console.log("Connected to database:", result.rows[0]);
    } finally {
      client.release(); // Release the connection back to the pool
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
const PORT = process.env.PORT || 3000;
// Middleware to parse JSON bodies
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

app.get("/orders", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM orders");
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

app
  .listen(PORT, () => {
    console.log("Server running at PORT:", PORT);
  })
  .on("error", (error: Error) => {
    // Gracefully handle error
    console.error("Server error", error);
    throw new Error(error.message);
  });
