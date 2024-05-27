import express from "express";
import cors from "cors";
import { initializeWebSocket } from "./websocket";
import { checkDatabaseConnection } from "./db";
import routes from "./routes";

const app = express();
const PORT = process.env.BACKEND_PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", routes);

checkDatabaseConnection();

const server = app
  .listen(PORT, () => {
    console.log(`Server running at PORT: ${PORT}`);
  })
  .on("error", (error: Error) => {
    console.error("Server error", error);
  });

initializeWebSocket(server);
