"use client";

import { useState, type PropsWithChildren } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/sheet";
import SearchBody from "./SearchBody";
import SearchHeader from "./SearchHeader";

function Search({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Sheet onOpenChange={(open) => setIsOpen(open)} open={isOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        className="h-[472px] w-full gap-0 bg-white"
        hideClose
        side="top"
      >
        <SheetHeader className="border-b border-b-black/5 p-0">
          <SheetTitle className="sr-only" />
          <SheetDescription className="sr-only" />
          <SearchHeader handleClose={handleClose} />
        </SheetHeader>
        <SearchBody handleClose={handleClose} />
      </SheetContent>
    </Sheet>
  );
}

export default Search;
