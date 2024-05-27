import * as React from "react";
import { CandlestickChart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import useWebSocketStore from "@/stores/useWebSocketStore";
import HealthIndicator from "./HealthIndicator";
export function AdminDrawer() {
  const { isConnected } = useWebSocketStore();
  const [selectedAction, setSelectedAction] = React.useState("");
  async function executeAction() {
    if (selectedAction === "match") {
      try {
        console.log("Match Clicked");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/match`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Match Successful", data);
      } catch (error) {
        console.error("Matching Error", error);
      }
    } else if (selectedAction === "delete") {
      try {
        console.log("Delete Clicked");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/delete-all`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Network response was not ok: ${errorText}`);
        }
        console.log("Delete Successful");
      } catch (error) {
        if (error instanceof Error) {
          console.error("Deletion Error:", error.message);
        } else {
          console.error("Deletion Error:", error);
        }
      }
    }
  }
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="flex justify-center items-center py-3 relative">
          <Button variant="default">Admin Menu</Button>
          <div className="absolute right-10 flex">
            <p className="mr-3">Server Status: </p>
            <div className="mt-1">
              <HealthIndicator isConnected={isConnected} />
            </div>
          </div>
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Admin Menu</DrawerTitle>
            <DrawerDescription>Sudo Dudo Do</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0 flex justify-around">
            <div className="flex flex-col items-center">
              <Button
                variant="outline"
                size="icon"
                className={`h-20 w-20 shrink-0 rounded-full hover:bg-purple-400 ${
                  selectedAction === "match" ? "bg-purple-300" : ""
                }`}
                onClick={() => setSelectedAction("match")}
              >
                <CandlestickChart className="h-16 w-16" />
                <span className="sr-only">Matching</span>
              </Button>
              <span className="mt-2 text-xs">Matching Algo</span>
            </div>
            <div className="flex flex-col items-center">
              <Button
                variant="outline"
                size="icon"
                className={`h-20 w-20 shrink-0 rounded-full hover:bg-purple-400 ${
                  selectedAction === "delete" ? "bg-purple-300" : ""
                }`}
                onClick={() => setSelectedAction("delete")}
              >
                <Trash2 className="h-16 w-16" />
                <span className="sr-only">Delete</span>
              </Button>
              <span className="mt-2 text-xs">Delete All Orders</span>
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={executeAction}>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
