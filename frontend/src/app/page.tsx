"use client";
import { useEffect } from "react";
import Orderbook from "@/components/Orderbook/Orderbook";
import TradingInterface from "@/components/TradingInterface/TradingInterface";
import UserInfo from "@/components/UserInfo";
import useWebSocketStore from "@/stores/useWebSocketStore";
import { AdminDrawer } from "@/components/AdminDrawer";

export default function Home() {
  const connectWebSocket = useWebSocketStore((state) => state.connectWebSocket);
  const fetchOrders = useWebSocketStore((state) => state.fetchOrders);
  const setOrders = useWebSocketStore((state) => state.setOrders);
  useEffect(() => {
    (async () => {
      connectWebSocket();
      const orders = await fetchOrders();
      setOrders(orders);
    })();
  }, [connectWebSocket, fetchOrders, setOrders]);

  return (
    <main className="min-h-screen grid grid-rows-8 grid-cols-6">
      <div className="grainy col-span-6 row-start-1">
        <UserInfo />
      </div>
      <div className="bg-gray-200 row-start-2 col-start-1 row-span-7 col-span-4">
        <Orderbook />
      </div>
      <div className="bg-gray-300 row-start-2 row-span-7 col-span-2">
        <TradingInterface />
      </div>
      <div className="grainy row-start-9 col-span-6">
        <AdminDrawer />
      </div>
    </main>
  );
}
