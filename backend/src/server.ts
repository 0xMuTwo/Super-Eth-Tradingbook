import express from "express";
import cors from "cors";
import fs from "fs";
import https from "https";
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

const httpsOptions = {
  key: fs.readFileSync('/etc/ssl/certs/privkey.pem'),
  cert: fs.readFileSync('/etc/ssl/certs/fullchain.pem')
};

const server = https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`Server running at PORT: ${PORT}`);
});

initializeWebSocket(server);
