import { EyeIcon, HeartIcon } from "lucide-react";
import { cn } from "@shared/lib/style";
import Divider from "@shared/ui/divider";

// 추후 데이터 연동시 props 확장 필요
interface MagazineCardInfoProps {
  className?: string;
  textColor?: "white" | "black";
  size?: "large" | "normal";
}

const styleMap = {
  large: {
    title: "text-[32px] max-sm:text-[24px]",
    category: "text-[14px] max-sm:text-[12px]",
    content: "text-[16px] max-sm:text-[14px]",
    author: "text-[14px] max-sm:text-[13px]",
    date: "text-[14px] max-sm:text-[13px]",
  },
  normal: {
    title: "text-[16px] max-sm:text-[18px] ",
    category: "text-[13px] max-sm:text-[12px]",
    content: "text-[14px] max-sm:text-[14px]",
    author: "text-[14px] max-sm:text-[14px]",
    date: "text-[14px] max-sm:text-[14px]",
  },
};

export function MagazineCardInfo({
  className,
  textColor,
  size = "normal",
}: MagazineCardInfoProps) {
  return (
    <div
      className={cn(
        "flex w-[275px] flex-col justify-center gap-[20px]",
        textColor === "white" ? "text-white" : "text-black",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className={styleMap[size].category}>SNEAKERS</span>
        <div className="flex items-center">
          <div className="flex items-center gap-[4px]">
            <HeartIcon height={14} width={14} />
            <span>100</span>
          </div>
          <Divider
            className={cn(
              "mx-[8px] block",
              textColor === "white" ? "bg-white/40" : "bg-black/40",
            )}
          />
          <div className="flex gap-[4px]">
            <EyeIcon height={14} width={14} />
            <span>100</span>
          </div>
        </div>
      </div>
      <h3 className={styleMap[size].title}>
        <b>사계절 신어도 좋은 여름 신발 추천, 베드락 샌들의 마운틴 글루</b>
      </h3>
      <p className={styleMap[size].content}>요약 내용입니다.</p>
      <div className={cn("flex flex-col gap-[40px]", "max-sm:gap-[30px]")}>
        <span
          className={cn(
            "max-sm:hidden",
            textColor === "white" ? "text-white" : "text-black/40",
            styleMap[size].date,
          )}
        >
          2025.05.26
        </span>
        <div className="flex items-center">
          <div className="flex items-center gap-[4px]">
            <div className="h-[24px] w-[24px] rounded-full bg-slate-300" />
            <span className={styleMap[size].author}>작가명</span>
          </div>
          <Divider
            className={cn(
              textColor === "white" ? "bg-white/40" : "bg-black/40",
            )}
          />
          <span
            className={cn(
              "hidden max-sm:inline",
              textColor === "white" ? "text-white" : "text-black",
              styleMap[size].date,
            )}
          >
            2025.05.26
          </span>
        </div>
      </div>
    </div>
  );
}
