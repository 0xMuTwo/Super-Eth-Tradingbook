import * as React from "react";
import { Variable, Trash2 } from "lucide-react";
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
export function AdminDrawer() {
  async function handleMatchClick() {
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
  }
  async function handleDeleteClick() {
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
        const errorText = await response.text(); // Await for the error text for better debugging
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
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="flex justify-center py-3">
          <Button variant="outline">Admin Menu</Button>
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
                className="h-20 w-20 shrink-0 rounded-full"
                onClick={handleMatchClick}
              >
                <Variable className="h-16 w-16" />
                <span className="sr-only">Matching</span>
              </Button>
              <span className="mt-2 text-xs">Matching Algo</span>
            </div>
            <div className="flex flex-col items-center">
              <Button
                variant="outline"
                size="icon"
                className="h-20 w-20 shrink-0 rounded-full"
                onClick={handleDeleteClick}
              >
                <Trash2 className="h-16 w-16" />
                <span className="sr-only">Delete</span>
              </Button>
              <span className="mt-2 text-xs">Delete All Orders</span>
            </div>
          </div>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
