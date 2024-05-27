export interface Order {
  username: string;
  price: number;
  size: number;
  type: "buy" | "sell";
  status: "open" | "closed";
  id: number;
  timestamp: string;
}
