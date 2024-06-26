import { create } from "zustand";
import { Order } from "@/lib/types";
import useUserInfoStore from "./useUserInfoStore";

interface UserState {
  username: string;
  assets: {
    ETH: number;
    USDT: number;
  };
}

const updateUserStates = (userStates: UserState[]) => {
  const userInfoStore = useUserInfoStore.getState();
  const currentUsername = userInfoStore.username;
  const matchingUser = userStates.find(
    (user) => user.username === currentUsername
  );
  if (matchingUser) {
    if (matchingUser.assets.ETH > 0) {
      userInfoStore.updateEthBalance(
        userInfoStore.ethBalance + matchingUser.assets.ETH
      );
    }
    if (matchingUser.assets.USDT > 0) {
      userInfoStore.updateUsdtBalance(
        userInfoStore.usdtBalance + matchingUser.assets.USDT
      );
    }
  }
};

interface WebSocketState {
  orders: Order[];
  webSocket: WebSocket | null;
  webSocketConnecting: boolean;
  isConnected: boolean;
  connectWebSocket: () => void;
  fetchOrders: () => Promise<Order[]>;
  setOrders: (newOrders: Order[]) => void;
  addOrder: (newOrder: Order) => void;
  clearOrders: () => void;
}

const useWebSocketStore = create<WebSocketState>((set, get) => ({
  orders: [],
  webSocket: null,
  webSocketConnecting: false,
  isConnected: false,

  connectWebSocket: () => {
    const { webSocket, webSocketConnecting, setOrders, clearOrders } = get();
    if (webSocket || webSocketConnecting) {
      console.warn(
        "WebSocket is already connected or in the process of connecting"
      );
      return;
    }
    set({ webSocketConnecting: true });
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WSS_URL}`);
    ws.onopen = () => {
      console.log("WebSocket connected");
      set({ webSocket: ws, webSocketConnecting: false, isConnected: true });
    };
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "newOrder") {
        get().addOrder(message.order);
      } else if (message.type === "orderMatch") {
        get().setOrders([
          ...message.results.orderBook.buyOrders,
          ...message.results.orderBook.sellOrders,
        ]);
        updateUserStates(message.results.userStates);
      } else if (message.type === "deleteAll") {
        clearOrders();
      }
    };
    ws.onclose = () => {
      console.log("WebSocket disconnected");
      set({ webSocket: null, isConnected: false });
    };
    ws.onerror = (error) => {
      console.error("WebSocket error", error);
      set({ webSocket: null, webSocketConnecting: false, isConnected: false });
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

  setOrders: (newOrders: Order[]) => set(() => ({ orders: newOrders })),
  addOrder: (newOrder: Order) =>
    set((state) => ({
      orders: [...state.orders, newOrder],
    })),
  clearOrders: () => set(() => ({ orders: [] })),
}));

export default useWebSocketStore;
