"use client";

import { Slot } from "@radix-ui/react-slot"; // shadcn의 Slot
import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  asChild?: boolean; // Slot 사용 여부
}

const VARIANT_CLASSES = {
  default: "bg-black text-white hover:bg-neutral-800",
  outline: "border border-neutral-200 bg-white text-black hover:bg-neutral-100",
  ghost: "bg-transparent hover:bg-neutral-100 text-black",
  destructive: "bg-red-600 text-white hover:bg-red-700",
};

const SIZE_CLASSES = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-6 text-lg",
};

export function Button({
  className,
  variant = "default",
  size = "md",
  isLoading = false,
  disabled,
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-transparent focus:ring-offset-0 disabled:bg-black/10",
        "cursor-pointer disabled:cursor-not-allowed disabled:text-black/40",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      data-slot="button"
      disabled={isLoading || disabled}
      {...props}
    >
      <div className="inline-flex items-center justify-center">
        {isLoading ? (
          <span className="mr-2 flex h-4 w-4 animate-spin items-center justify-center">
            <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent" />
          </span>
        ) : (
          children
        )}
      </div>
    </Comp>
  );
}
