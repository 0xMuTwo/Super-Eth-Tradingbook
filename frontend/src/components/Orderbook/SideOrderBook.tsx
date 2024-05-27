import React from "react";
import { Order } from "@/lib/types";
interface SideOrderBookProps {
  title: string;
  orders: Order[];
  orderType: "buy" | "sell";
}
const SideOrderBook: React.FC<SideOrderBookProps> = ({
  title,
  orders,
  orderType,
}) => {
  const maxTotal = Math.max(
    ...orders.map((order) => order.price * order.size),
    0
  );

  // Doing this because of Tailwind JIT compilation
  const bgColor = orderType === "buy" ? "bg-green-200" : "bg-red-200";
  const orderColorClass =
    orderType === "buy" ? "text-green-400" : "text-red-400";
  let cumulativeTotal = 0;
  return (
    <div
      className={`${orderType}-orders w-1/2 border border-slate-300 bg-slate-50 m-4 flex flex-col h-full`}
    >
      <h2 className="p-4">{title}</h2>
      <div className="p-4 grid grid-cols-5 gap-x-4 font-sans font-thin text-slate-900">
        <div>Side</div>
        <div>Price (USDT)</div>
        <div>Amount (ETH)</div>
        <div>Total (USDT)</div>
        <div>Sum (USDT)</div>
      </div>
      <div className="flex-grow overflow-y-scroll mb-10">
        {orders.length === 0 ? (
          <p className="p-4">No {orderType} orders</p>
        ) : (
          orders.map((order, index) => {
            const total = order.price * order.size;
            cumulativeTotal += total;
            const barWidth = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
            return (
              <div
                key={order.id}
                className="relative grid grid-cols-5 gap-x-4 p-4 bg-transparent"
              >
                <div
                  className={`absolute top-0 bottom-0 right-0 ${bgColor} opacity-50`}
                  style={{ width: `${barWidth}%`, zIndex: 0 }}
                />
                <p className={`relative z-10 ${orderColorClass}`}>
                  {orderType.charAt(0).toUpperCase() + orderType.slice(1)}{" "}
                  {index + 1}
                </p>
                <p className="relative z-10">{order.price}</p>
                <p className="relative z-10">{order.size}</p>
                <p className="relative z-10">{total.toFixed(2)}</p>
                <p className="relative z-10">
                  {cumulativeTotal.toFixed(2)}
                </p>{" "}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default SideOrderBook;
