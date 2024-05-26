export interface Order {
  id: number;
  username: string;
  price: string;
  size: string;
  type: "buy" | "sell";
  timestamp: string;
  status: "open" | "closed" | "cancelled";
}
