import { cn } from "@/shared/lib/style";
import { Card } from "@/shared/ui/card";
import Divider from "@/shared/ui/divider";

interface ArticleCardProps {
  className?: string;
}

export default function ArticleCard({ className }: ArticleCardProps) {
  return (
    <Card
      className={cn(
        "h-[500px] w-[625px] flex-1",
        "max-sm:h-[403px] max-sm:w-full",
        className,
      )}
      extraInfo={
        <div className={cn("text-[14px] text-black/40", "max-sm:text-[12px]")}>
          <span>오끼드</span>
          <Divider className="mx-[8px] inline-block bg-black/40 max-sm:inline-block" />
          <span>2025.05.30</span>
        </div>
      }
      image={<div className="h-[460px] w-full bg-slate-300" />}
      subTitle={<p className="max-sm:text-[13px]">마음이 모이는곳</p>}
      title={
        <h4 className={cn("text-[18px] font-semibold", "max-sm:text-[16px]")}>
          디자인 갤러리
        </h4>
      }
    />
  );
}
