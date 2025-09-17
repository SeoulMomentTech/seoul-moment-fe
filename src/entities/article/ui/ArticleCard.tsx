import { cn } from "@/shared/lib/style";
import { Card } from "@/shared/ui/card";
import { AuthorWithDate } from "@/widgets/author-with-date";

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
      extraInfo={<AuthorWithDate author="오끼드" date="2025.05.30" />}
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
