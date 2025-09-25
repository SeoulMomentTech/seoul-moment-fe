import Image from "next/image";
import { cn } from "@/shared/lib/style";
import { Card } from "@/shared/ui/card";
import { AuthorWithDate } from "@/widgets/author-with-date";

interface ArticleCardProps {
  className?: string;
  title: string;
  subTitle: string;
  author: string;
  date: string;
  imageUrl: string;
}

export default function ArticleCard({
  className,
  title,
  subTitle,
  imageUrl,
  author,
  date,
}: ArticleCardProps) {
  return (
    <Card
      className={cn(
        "h-[500px] w-[625px] flex-1",
        "max-sm:h-[403px] max-sm:w-full",
        className,
      )}
      extraInfo={<AuthorWithDate author={author} date={date} />}
      image={
        <figure className="h-[460px] w-full bg-slate-300">
          <Image
            alt=""
            className="h-full"
            height={460}
            src={imageUrl}
            width={800}
          />
        </figure>
      }
      subTitle={<p className="max-sm:text-[13px]">{subTitle}</p>}
      title={
        <h4 className={cn("text-[18px] font-semibold", "max-sm:text-[16px]")}>
          {title}
        </h4>
      }
    />
  );
}
