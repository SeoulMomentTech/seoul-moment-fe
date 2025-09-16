import LifeStyleCard from "@/entities/article/ui/StyleCard";
import { cn } from "@/shared/lib/style";

interface LifeStyleListProps {
  className?: string;
}

export default function LifeStyleList({ className }: LifeStyleListProps) {
  return (
    <div
      className={cn(
        "grid gap-x-[40px] gap-y-[50px]",
        "max-sm:flex max-sm:flex-col max-sm:gap-[30px]",
        className,
      )}
      style={{
        gridTemplateColumns: `repeat(4,1fr)`,
      }}
    >
      <LifeStyleCard />
      <LifeStyleCard />
      <LifeStyleCard />
      <LifeStyleCard />
    </div>
  );
}
