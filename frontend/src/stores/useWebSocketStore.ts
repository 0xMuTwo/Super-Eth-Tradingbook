import { create } from "zustand";
import { Order } from "@/lib/types";
interface WebSocketState {
  orders: Order[];
  setOrders: (newOrders: Order[]) => void;
  addOrder: (newOrder: Order) => void;
  updateMatchResults: (modifiedOrders: Order[]) => void;
  webSocket: WebSocket | null;
  webSocketConnecting: boolean;
  connectWebSocket: () => void;
  fetchOrders: () => Promise<Order[]>;
}

const useWebSocketStore = create<WebSocketState>((set, get) => ({
  orders: [],
  setOrders: (newOrders: Order[]) => set(() => ({ orders: newOrders })),
  addOrder: (newOrder: Order) =>
    set((state) => ({
      orders: [...state.orders, newOrder],
    })),
  updateMatchResults: (modifiedOrders: Order[]) =>
    set((state) => ({
      orders: modifiedOrders,
    })),

  webSocket: null,
  webSocketConnecting: false,
  connectWebSocket: () => {
    const { webSocket, webSocketConnecting, setOrders } = get();
    if (webSocket || webSocketConnecting) {
      console.warn(
        "WebSocket is already connected or in the process of connecting"
      );
      return;
    }

    set({ webSocketConnecting: true });
    const ws = new WebSocket(`ws://localhost:5001`); //TODO Put this in env
    ws.onopen = () => {
      console.log("WebSocket connected");
      set({ webSocket: ws, webSocketConnecting: false });
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("WSS DATA: ", message);
      if (message.type === "newOrder") {
        get().addOrder(message.order);
      } else if (message.type === "orderMatch") {
        get().updateMatchResults(message.results);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");

      set({ webSocket: null });
    };

    ws.onerror = (error) => {
      console.error("WebSocket error", error);

      set({ webSocket: null, webSocketConnecting: false });
    };

    // If already opening, we should handle failed connection gracefully
    set({ webSocketConnecting: true, webSocket: ws });
  },

  fetchOrders: async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/book`);

      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }

      const data: Order[] = await res.json();

      set((state) => ({ orders: data }));

      return data;
    } catch (error) {
      console.error(error);

      return [];
    }
  },
}));

export default useWebSocketStore;
