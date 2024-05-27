"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useUserInfoStore from "@/stores/useUserInfoStore";
import TradingOrderForm from "./TradingOrderForm";

const TradingInterface = () => {
  const {
    ethBalance,
    usdtBalance,
    username,
    updateEthBalance,
    updateUsdtBalance,
  } = useUserInfoStore((state) => ({
    ethBalance: state.ethBalance,
    usdtBalance: state.usdtBalance,
    username: state.username,
    updateEthBalance: state.updateEthBalance,
    updateUsdtBalance: state.updateUsdtBalance,
  }));
  const [buyAmount, setBuyAmount] = useState<number>(1);
  const [buyPrice, setBuyPrice] = useState<number>(10);
  const [sellAmount, setSellAmount] = useState<number>(1);
  const [sellPrice, setSellPrice] = useState<number>(10);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );
  const handleSubmit = async (
    side: "buy" | "sell",
    amount: number,
    price: number
  ) => {
    const totalCost = side === "buy" ? amount * price : amount;
    const availableBalance = side === "buy" ? usdtBalance : ethBalance;
    if (totalCost > availableBalance) {
      setFeedbackMessage(`Not enough balance to complete the ${side} order.`);
      setMessageType("error");
      return;
    }
    const order = {
      order: {
        username,
        side,
        size: amount,
        price,
      },
    };
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(order),
        }
      );
      if (response.ok) {
        if (side === "buy") {
          updateUsdtBalance(usdtBalance - totalCost);
        } else {
          updateEthBalance(ethBalance - amount);
        }
        setFeedbackMessage("Order placed successfully!");
        setMessageType("success");
      } else {
        throw new Error("Error placing order");
      }
    } catch (error) {
      setFeedbackMessage("Error placing order. Please try again.");
      setMessageType("error");
    } finally {
      setTimeout(() => {
        setFeedbackMessage(null);
      }, 3000);
    }
  };
  return (
    <div className="flex h-full justify-center items-center">
      <Tabs defaultValue="buy" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buy">Buy</TabsTrigger>
          <TabsTrigger value="sell">Sell</TabsTrigger>
        </TabsList>
        <TabsContent value="buy">
          <TradingOrderForm
            side="buy"
            amount={buyAmount}
            price={buyPrice}
            balance={usdtBalance}
            setAmount={setBuyAmount}
            setPrice={setBuyPrice}
            onSubmit={() => handleSubmit("buy", buyAmount, buyPrice)}
            feedbackMessage={feedbackMessage}
            messageType={messageType}
          />
        </TabsContent>
        <TabsContent value="sell">
          <TradingOrderForm
            side="sell"
            amount={sellAmount}
            price={sellPrice}
            balance={ethBalance}
            setAmount={setSellAmount}
            setPrice={setSellPrice}
            onSubmit={() => handleSubmit("sell", sellAmount, sellPrice)}
            feedbackMessage={feedbackMessage}
            messageType={messageType}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default TradingInterface;
