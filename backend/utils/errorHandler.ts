import { Response } from "express";

export function handleError(res: Response, err: any, message: string) {
  const errorMessage = err instanceof Error ? err.message : err;
  console.error(message, errorMessage);
  res.status(500).send("Internal Server Error");
}
