import type { ComponentProps } from "react";

import { cn } from "../lib/style";

interface FixedBoxProps extends ComponentProps<"div"> {
  direction?: "top" | "bottom";
}

const styleMap = {
  direction: {
    top: "top-0",
    bottom: "bottom-0",
  },
  base: "fixed w-full bg-white",
};

function FixedBox({
  children,
  className,
  direction = "top",
  ...props
}: FixedBoxProps) {
  return (
    <div
      className={cn(styleMap.base, styleMap.direction[direction], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default FixedBox;
