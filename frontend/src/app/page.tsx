import Orderbook from "@/components/Orderbook/Orderbook";
import TradingInterface from "@/components/TradingInterface/TradingInterface";
import UserInfo from "@/components/UserInfo";

export default function Home() {
  return (
    <main className="min-h-screen grid grid-rows-8 grid-cols-6">
      {/*  */}
      <div className="grainy col-span-6 row-start-1">
        <UserInfo />
      </div>
      <div className="bg-gray-200 row-start-2 col-start-1 row-span-8 col-span-4">
        <Orderbook />
      </div>
      <div className="bg-gray-300 row-start-2 row-span-8 col-span-2">
        <TradingInterface />
      </div>
    </main>
  );
}
