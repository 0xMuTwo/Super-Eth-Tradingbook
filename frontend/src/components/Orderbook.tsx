"use client";
import React, { useEffect, useState } from "react";
import { Order } from "@/lib/types";

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

  return (
    <div>
      <p>Orderbook</p>
      <button onClick={() => fetchOrders(false)}>
        Refresh {refreshing && <span>Loading...</span>}
      </button>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        orders.map((order) => (
          <div key={order.id}>
            <p>ID: {order.id}</p>
            <p>Username: {order.username}</p>
            <p>Price: {order.price}</p>
            <p>Size: {order.size}</p>
            <p>Type: {order.type}</p>
            <p>Timestamp: {new Date(order.timestamp).toLocaleString()}</p>
            <p>Status: {order.status}</p>
            <hr />
          </div>
        ))
      )}
    </div>
  );
};

export default Orderbook;
