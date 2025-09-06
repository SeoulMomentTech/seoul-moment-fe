import { cn } from "../lib/style";

interface DividerProps {
  className?: string;
}

export default function Divider({ className }: DividerProps) {
  return (
    <span
      className={cn("mx-[10px] hidden h-[8px] w-[1px] max-sm:block", className)}
    />
  );
}
