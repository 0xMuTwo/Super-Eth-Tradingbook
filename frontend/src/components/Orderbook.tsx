"use client";
import React, { useEffect, useState } from "react";
import { Order } from "@/lib/types";
import { Button } from "./ui/button";
import SideOrderBook from "./SideOrderBook";

const getOrderbook = async (): Promise<Order[]> => {
  const res = await fetch("http://localhost:5001/book");
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
};

const Orderbook: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fetchOrders = async (isInitialLoad = false) => {
    isInitialLoad ? setLoading(true) : setRefreshing(true);
    try {
      const data = await getOrderbook();
      setOrders(data);
      setError(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      isInitialLoad ? setLoading(false) : setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);
  }, []);

  const buyOrders = orders
    .filter((order) => order.type === "buy")
    .sort((a, b) => b.price - a.price);

  const sellOrders = orders
    .filter((order) => order.type === "sell")
    .sort((a, b) => a.price - b.price);

  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-10 items-center h-full">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Orderbook
          </h1>
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            &mdash;
          </h2>
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            ETH/USDT
          </h2>
        </div>
        <div className="pb-5 pl-5 ba">
          <Button onClick={() => fetchOrders(false)}>
            {refreshing ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div className="order-book flex bg-background">
          <SideOrderBook title="Buy Order" orders={buyOrders} orderType="buy" />
          <SideOrderBook
            title="Sell Order"
            orders={sellOrders}
            orderType="sell"
          />
        </div>
      )}
    </div>
  );
};

export default Orderbook;
