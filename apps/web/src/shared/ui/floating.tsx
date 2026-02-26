import type { ComponentProps } from "react";

import { cn } from "@seoul-moment/ui";

export function Floating({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn("fixed flex items-center justify-center", className)}
      {...props}
    >
      {children}
    </div>
  );
}
