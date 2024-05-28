import { ChangeEvent, FocusEvent, FC } from "react";
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
import TradingNotification from "./TradingNotification";

const handleInputChange =
  (setter: React.Dispatch<React.SetStateAction<number>>, balance?: number) =>
  (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const numericValue = parseFloat(value);
    if (value === "" || numericValue >= 0) {
      setter(numericValue);
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

interface TradingOrderFormProps {
  side: "buy" | "sell";
  amount: number;
  price: number;
  balance: number;
  setAmount: React.Dispatch<React.SetStateAction<number>>;
  setPrice: React.Dispatch<React.SetStateAction<number>>;
  onSubmit: () => void;
  feedbackMessage: string | null;
  messageType: "success" | "error";
}

const TradingOrderForm: FC<TradingOrderFormProps> = ({
  side,
  amount,
  price,
  balance,
  setAmount,
  setPrice,
  onSubmit,
  feedbackMessage,
  messageType,
}) => {
  const totalCost = amount * price;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{side === "buy" ? "Buy" : "Sell"}</CardTitle>
        <CardDescription>
          {side === "buy" ? "Bid USDT, Get ETH" : "Bid ETH, Get USDT"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-4 mr-10 items-center gap-2">
          <Label className="col-span-1" htmlFor={`${side}-amount`}>
            Amount
          </Label>
          <Input
            className="col-span-2"
            id={`${side}-amount`}
            type="number"
            value={amount}
            onChange={handleInputChange(setAmount, balance)}
            onBlur={handleBlur(setAmount, 1)}
          />
          <Label className="col-span-1" htmlFor={`${side}-amount`}>
            {side === "sell" ? "ETH" : "ETH"}
          </Label>
        </div>
        <div className="grid grid-cols-4 mr-10 items-center gap-2">
          <Label className="col-span-1" htmlFor={`${side}-price`}>
            Price
          </Label>
          <Input
            className="col-span-2"
            id={`${side}-price`}
            type="number"
            value={price}
            onChange={handleInputChange(setPrice)}
            onBlur={handleBlur(setPrice, 10)}
          />
          <Label className="col-span-1" htmlFor={`${side}-price`}>
            USDT/ETH
          </Label>
        </div>
        <div className="grid grid-cols-4 mr-10 items-center gap-2">
          <Label className="col-span-1" htmlFor={`${side}-total-cost`}>
            Total
          </Label>
          <Input
            className="col-span-2"
            id={`${side}-total-cost`}
            type="number"
            value={totalCost}
            readOnly
            disabled
          />
          <Label className="col-span-1" htmlFor={`${side}-total-cost`}>
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
        <Button onClick={onSubmit}>{side === "buy" ? "Bid" : "Sell"}</Button>
      </CardFooter>
    </Card>
  );
};

export default TradingOrderForm;
