import type { PropsWithChildren } from "react";

import { cn } from "@shared/lib/style";

interface SectionWithLabelProps extends PropsWithChildren {
  label?: React.ReactElement;
  className?: string;
}

export function SectionWithLabel({
  label,
  children,
  className,
}: SectionWithLabelProps) {
  return (
    <section className={cn("flex flex-col", className)}>
      {label && (
        <div className="flex items-center justify-between">{label}</div>
      )}
      {children}
    </section>
  );
}
