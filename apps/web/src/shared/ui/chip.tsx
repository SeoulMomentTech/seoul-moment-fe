import { Button } from "@seoul-moment/ui";
import type { ComponentProps } from "react";
import { cn } from "../lib/style";

interface ChipProps extends ComponentProps<"button"> {
  className?: string;
  active?: boolean;
}

export default function Chip({
  active,
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <Button
      className={cn(
        "flex items-center justify-center rounded-full px-[12px] py-[8px]",
        "text-body-3 border border-black/10 bg-white",
        active &&
          "border-black bg-black font-semibold text-white hover:bg-black",
        className,
      )}
      {...props}
      variant="outline"
    >
      {children}
    </Button>
  );
}
