"use client";
import React from "react";
import SideOrderBook from "./SideOrderBook";
import useWebSocketStore from "@/stores/useWebSocketStore";
const Orderbook: React.FC = () => {
  const orders = useWebSocketStore((state) => state.orders);
  const buyOrders = orders
    .filter((order) => order.type === "buy")
    .sort((a, b) => b.price - a.price);
  const sellOrders = orders
    .filter((order) => order.type === "sell")
    .sort((a, b) => a.price - b.price);
  return (
    <div className="flex flex-col h-full max-h-[50vh]">
      <div className="flex gap-10 items-center h-24 py-5">
        <h1 className="pl-20 scroll-m-20 text-4xl font-extrabold lg:text-5xl">
          Orderbook
        </h1>
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold">
          &mdash;
        </h2>
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold">
          ETH/USDT
        </h2>
      </div>
      <div className="flex max-h-[70vh]">
        <SideOrderBook title="Buy Order" orders={buyOrders} orderType="buy" />
        <SideOrderBook
          title="Sell Order"
          orders={sellOrders}
          orderType="sell"
        />
      </div>
    </div>
  );
};
export default Orderbook;
