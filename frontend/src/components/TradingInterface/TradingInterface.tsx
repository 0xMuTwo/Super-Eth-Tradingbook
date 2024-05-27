"use client";
import { useState, ChangeEvent, FocusEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TradingNotification from "./TradingNotification";
import useUserInfoStore from "@/stores/useUserInfoStore";

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
  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<number>>, balance?: number) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      const numericValue = parseFloat(value);
      if (value === "" || numericValue >= 0) {
        if (balance !== undefined && numericValue > balance) {
          setFeedbackMessage(`Value exceeds your balance of ${balance}`);
          setMessageType("error");
        } else {
          setter(numericValue);
          setFeedbackMessage(null);
        }
      }
    };
  const handleBlur =
    (
      setter: React.Dispatch<React.SetStateAction<number>>,
      defaultValue: number
    ) =>
    (event: FocusEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (value === "") {
        setter(defaultValue);
      }
    };

  const handleSubmit = async (
    side: "buy" | "sell",
    amount: number,
    price: number
  ) => {
    const order = {
      order: {
        username,
        side,
        size: amount,
        price,
      },
    };
    console.log("Order Leaving: ", order);
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
        const totalCost = amount * price;
        updateUsdtBalance(usdtBalance - totalCost);
      } else if (side === "sell") {
        updateEthBalance(ethBalance - amount);
      }
      setFeedbackMessage("Order placed successfully!");
      setMessageType("success");
    } else {
      setFeedbackMessage("Error placing order. Please try again.");
      setMessageType("error");
    }
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3000);
  };

  return (
    <div className="flex h-full justify-center items-center">
      <Tabs defaultValue="buy" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buy">Buy</TabsTrigger>
          <TabsTrigger value="sell">Sell</TabsTrigger>
        </TabsList>
        <TabsContent value="buy">
          <Card>
            <CardHeader>
              <CardTitle>Buy</CardTitle>
              <CardDescription>Bid USDT, Get ETH</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-4 mr-10 items-center gap-2">
                <Label className="col-span-1" htmlFor="buy-amount">
                  Amount
                </Label>
                <Input
                  className="col-span-2"
                  id="buy-amount"
                  type="number"
                  value={buyAmount}
                  onChange={handleInputChange(setBuyAmount)}
                  onBlur={handleBlur(setBuyAmount, 1)}
                />

                <Label className="col-span-1" htmlFor="buy-amount">
                  ETH
                </Label>
              </div>
              <div className="grid grid-cols-4 mr-10 items-center gap-2">
                <Label className="col-span-1" htmlFor="buy-price">
                  Price
                </Label>
                <Input
                  className="col-span-2"
                  id="buy-price"
                  type="number"
                  value={buyPrice}
                  onChange={handleInputChange(setBuyPrice, usdtBalance)}
                  onBlur={handleBlur(setBuyPrice, 10)}
                />
                <Label className="col-span-1" htmlFor="buy-price">
                  USDT
                </Label>
              </div>
              {feedbackMessage && (
                <TradingNotification
                  className="col-span-4"
                  message={feedbackMessage}
                  type={messageType}
                />
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSubmit("buy", buyAmount, buyPrice)}>
                Bid
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="sell">
          <Card>
            <CardHeader>
              <CardTitle>Sell</CardTitle>
              <CardDescription>Bid ETH, Get USDT</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-4 mr-10 items-center gap-2">
                <Label className="col-span-1" htmlFor="sell-amount">
                  Amount
                </Label>
                <Input
                  className="col-span-2"
                  id="sell-amount"
                  type="number"
                  value={sellAmount}
                  onChange={handleInputChange(setSellAmount, ethBalance)}
                  onBlur={handleBlur(setSellAmount, 1)}
                />
                <Label className="col-span-1" htmlFor="sell-amount">
                  ETH
                </Label>
              </div>
              <div className="grid grid-cols-4 mr-10 items-center gap-2">
                <Label className="col-span-1" htmlFor="sell-price">
                  Price
                </Label>
                <Input
                  className="col-span-2"
                  id="sell-price"
                  type="number"
                  value={sellPrice}
                  onChange={handleInputChange(setSellPrice)}
                  onBlur={handleBlur(setSellPrice, 10)}
                />
                <Label className="col-span-1" htmlFor="sell-price">
                  USDT
                </Label>
              </div>
              {feedbackMessage && (
                <TradingNotification
                  className="col-span-4"
                  message={feedbackMessage}
                  type={messageType}
                />
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSubmit("sell", sellAmount, sellPrice)}
              >
                Sell
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradingInterface;
