import { cn } from "@shared/lib/style";

interface LookbookItemProps {
  className?: string;
}

export function LookbookItem({ className }: LookbookItemProps) {
  return (
    <div className={cn("w-full bg-slate-300", className)}>
      {/* Placeholder for a lookbook image */}
    </div>
  );
}
