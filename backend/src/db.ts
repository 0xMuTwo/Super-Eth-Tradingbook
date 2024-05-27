import { Pool } from "pg";

export const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

export async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT NOW()");
      console.log("Connected to database:", result.rows[0]);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error connecting to the database", err);
  }
}
