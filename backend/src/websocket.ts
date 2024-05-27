import { Server } from "ws";

let wss: Server;

export function initializeWebSocket(server: any) {
  wss = new Server({ server });
  wss.on("connection", (ws) => {
    console.log("New WebSocket client connected");
    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });
}

export function broadcastMessage(message: any) {
  if (!wss) return;
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  });
}
