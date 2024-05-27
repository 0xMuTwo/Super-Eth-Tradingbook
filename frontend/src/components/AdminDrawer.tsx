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
  const [goal, setGoal] = React.useState(350);
  function onClick(adjustment: number) {
    setGoal(Math.max(200, Math.min(400, goal + adjustment)));
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
                onClick={() => onClick(-10)}
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
