import { cn } from "@/shared/lib/style";
import { Card } from "@/shared/ui/card";
import Divider from "@/shared/ui/divider";

interface StyleCardProps {
  className?: string;
  imageClassName?: string;
  textColor?: string;
}

export default function StyleCard({
  className,
  imageClassName,
  textColor = "black",
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
          <span>오끼드</span>
          <Divider
            className={cn(
              "mx-[8px] inline-block bg-black/40 max-sm:inline-block",
              textColor === "white" && "bg-white/80",
            )}
          />
          <span>2025.05.30</span>
        </div>
      }
      image={
        <div
          className={cn(
            "h-[200px] w-full bg-slate-300 max-sm:h-[221px]",
            imageClassName,
          )}
        />
      }
      subTitle={
        <p
          className={cn(
            "max-sm:text-[13px]",
            textColor === "white" && "text-white",
          )}
        >
          마음이 모이는곳
        </p>
      }
      title={
        <div
          className={cn(
            "flex flex-col gap-[10px]",
            textColor === "white" && "text-white",
          )}
        >
          <span className="text-body-4 max-sm:text-body-5">ITEM</span>
          <h4 className={cn("text-[18px] font-semibold", "max-sm:text-[16px]")}>
            디자인 갤러리
          </h4>
        </div>
      }
    />
  );
}
