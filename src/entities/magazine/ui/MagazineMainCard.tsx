import { cn } from "@shared/lib/style";
import { MagazineCardInfo } from "./MagazineCardInfo";

interface MagazineMainCardProps {
  className?: string;
  direction?: "row" | "row-reverse";
}

export function MagazineMainCard({
  className,
  direction = "row",
}: MagazineMainCardProps) {
  return (
    <div
      className={cn(
        "flex gap-[30px]",
        {
          "flex-row-reverse": direction === "row-reverse",
        },
        "max-sm:flex-col max-sm:py-[20px]",
        className,
      )}
    >
      <div
        className={cn(
          "h-[327px] w-[305px] bg-slate-300",
          "max-sm:h-[202px] max-sm:w-full",
        )}
      />
      <MagazineCardInfo />
    </div>
  );
}
