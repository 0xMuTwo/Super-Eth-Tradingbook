import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { pool } from "./db";
import { matchOrders } from "./orderMatching";
import { broadcastMessage } from "./websocket";
import { handleError } from "../utils/errorHandler";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.status(200).send("Hello World");
});

router.get("/health", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT 1");
    res
      .status(200)
      .send(result.rowCount === 1 ? "OK" : "Database health check failed");
  } catch (err) {
    handleError(res, err, "Health check error");
  }
});

router.get("/book", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orders WHERE status = 'open' ORDER BY price DESC, timestamp ASC"
    );
    res.status(200).json(result.rows);
  } catch (err) {
    handleError(res, err, "Error fetching orders");
  }
});

router.delete("/delete-all", async (req: Request, res: Response) => {
  try {
    await pool.query("DELETE FROM orders");
    broadcastMessage({
      type: "deleteAll",
      message: "All orders have been deleted",
    });
    res.status(200).send("All orders have been deleted");
  } catch (err) {
    handleError(res, err, "Error deleting all orders");
  }
});

router.post(
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
      broadcastMessage({ type: "newOrder", order: result.rows[0] });
      res.status(201).json(result.rows[0]);
    } catch (err) {
      handleError(res, err, "Error inserting order");
    }
  }
);

router.post("/match", async (req: Request, res: Response) => {
  try {
    const matchResults = await matchOrders();
    broadcastMessage({ type: "orderMatch", results: matchResults });
    res.status(200).json(matchResults);
  } catch (err) {
    handleError(res, err, "Error matching orders");
  }
});
export default router;
