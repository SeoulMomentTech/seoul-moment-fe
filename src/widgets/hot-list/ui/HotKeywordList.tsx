import StyleCard from "@/entities/article/ui/StyleCard";
import { cn } from "@/shared/lib/style";

interface HotKeywordListProps {
  className?: string;
}

export default function HotKeywordList({ className }: HotKeywordListProps) {
  return (
    <div
      className={cn(
        "flex gap-[30px] max-sm:w-full max-sm:gap-[16px]",
        className,
      )}
    >
      <StyleCard
        className="h-[418px] max-sm:h-[323px] max-sm:min-w-[208px]"
        imageClassName="h-[297px] max-sm:h-[208px]"
        textColor="white"
      />
      <StyleCard
        className="h-[418px] max-sm:h-[323px] max-sm:min-w-[208px]"
        imageClassName="h-[297px] max-sm:h-[208px]"
        textColor="white"
      />
      <StyleCard
        className="h-[418px] max-sm:h-[323px] max-sm:min-w-[208px]"
        imageClassName="h-[297px] max-sm:h-[208px]"
        textColor="white"
      />
    </div>
  );
}
