import React from "react";
import { cn } from "@/lib/utils";

interface NotificationProps {
  message: string;
  type: "success" | "error";
  className?: string;
}

const TradingNotification: React.FC<NotificationProps> = ({
  message,
  type,
  className,
}) => {
  return (
    <div
      className={cn(
        "p-4 rounded-md text-white",
        {
          "bg-green-500": type === "success",
          "bg-red-500": type === "error",
        },
        className
      )}
    >
      {message}
    </div>
  );
};

export default TradingNotification;
