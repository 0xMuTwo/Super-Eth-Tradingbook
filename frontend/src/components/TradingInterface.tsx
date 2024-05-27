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

const TradingInterface = () => {
  const [buyAmount, setBuyAmount] = useState<number>(1);
  const [buyPrice, setBuyPrice] = useState<number>(10);
  const [sellAmount, setSellAmount] = useState<number>(1);
  const [sellPrice, setSellPrice] = useState<number>(10);
  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<number>>) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (value === "" || parseFloat(value) >= 0) {
        setter(parseFloat(value)); // Allow empty string or non-negative values
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
        setter(defaultValue); // Set to default value on blur if input is empty
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
                  onChange={handleInputChange(setBuyPrice)}
                  onBlur={handleBlur(setBuyPrice, 10)}
                />
                <Label className="col-span-1" htmlFor="buy-price">
                  USDT
                </Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Bid</Button>
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
                  onChange={handleInputChange(setSellAmount)}
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
            </CardContent>
            <CardFooter>
              <Button>Bid</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradingInterface;
