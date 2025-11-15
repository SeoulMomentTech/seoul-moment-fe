import type { ReactNode } from "react";

import { cn } from "@shared/lib/style";

interface EmptyProps {
  className?: string;
  icon: ReactNode;
  description: string;
}

export default function Empty({ className, icon, description }: EmptyProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-[16px]",
        className,
      )}
    >
      {icon}
      <p className="text-body-3 text-black/40">{description}</p>
    </div>
  );
}
