import React from "react";
import { cn } from "@/lib/utils";
interface HealthIndicatorProps {
  isConnected: boolean;
  className?: string;
}

const HealthIndicator: React.FC<HealthIndicatorProps> = ({ isConnected }) => {
  return (
    <div
      className={cn(
        "w-4 h-4 rounded-full animate-pulse",

        {
          "bg-green-500": isConnected,

          "bg-red-500": !isConnected,
        }
      )}
    />
  );
};

export default HealthIndicator;
