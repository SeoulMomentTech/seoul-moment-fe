"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import * as React from "react";
import { cn } from "../../lib/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        "flex select-none items-center gap-2 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-70",
        className,
      )}
      data-slot="label"
      {...props}
    />
  );
}

export { Label };
