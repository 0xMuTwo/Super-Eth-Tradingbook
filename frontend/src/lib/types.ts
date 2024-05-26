export interface Order {
  id: number;
  username: string;
  price: number;
  size: number;
  type: "buy" | "sell";
  timestamp: string;
  status: "open" | "closed" | "cancelled";
}
