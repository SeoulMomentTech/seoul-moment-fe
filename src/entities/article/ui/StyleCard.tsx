import { cn } from "@/shared/lib/style";
import { Card } from "@/shared/ui/card";
import Divider from "@/shared/ui/divider";

interface StyleCardProps {
  className?: string;
  imageClassName?: string;
  textColor?: string;
  author: string;
  date: string;
  category: string;
  title: string;
  subTitle: string;
  imageUrl: string;
}

export default function StyleCard({
  className,
  imageClassName,
  textColor = "black",
  author,
  date,
  category,
  title,
  subTitle,
  imageUrl,
}: StyleCardProps) {
  return (
    <Card
      className={cn(
        "h-[365px] flex-1 justify-between gap-[20px]",
        "max-sm:h-[390px] max-sm:w-full",
        className,
      )}
      contentWrapperClassName="gap-[20px]"
      extraInfo={
        <div
          className={cn(
            "text-[14px] text-black/40",
            "max-sm:text-[12px]",
            textColor === "white" && "text-white",
          )}
        >
          <span>{author}</span>
          <Divider
            className={cn(
              "mx-[8px] inline-block bg-black/40 max-sm:inline-block",
              textColor === "white" && "bg-white/80",
            )}
          />
          <span>{date}</span>
        </div>
      }
      image={
        <div
          className={cn(
            "h-[200px] w-full bg-slate-300 max-sm:h-[221px]",
            imageClassName,
          )}
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      }
      subTitle={
        <p
          className={cn(
            "max-sm:text-[13px]",
            textColor === "white" && "text-white",
          )}
        >
          {subTitle}
        </p>
      }
      title={
        <div
          className={cn(
            "flex flex-col gap-[10px]",
            textColor === "white" && "text-white",
          )}
        >
          <span className="text-body-4 max-sm:text-body-5">{category}</span>
          <h4 className={cn("text-[18px] font-semibold", "max-sm:text-[16px]")}>
            {title}
          </h4>
        </div>
      }
    />
  );
}
