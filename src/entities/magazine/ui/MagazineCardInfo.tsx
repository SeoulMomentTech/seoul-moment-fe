import { cn } from "@/shared/lib/style";
import Divider from "@/shared/ui/divider";

// 추후 데이터 연동시 props 확장 필요
interface MagazineCardInfoProps {
  className?: string;
  textColor?: "white" | "black";
}

export function MagazineCardInfo({
  className,
  textColor,
}: MagazineCardInfoProps) {
  return (
    <div
      className={cn(
        "flex w-[275px] flex-col justify-center gap-[20px]",
        textColor === "white" ? "text-white" : "text-black",
        className,
      )}
    >
      <div>
        <span>SNEAKERS</span>
      </div>
      <h3>
        <b>사계절 신어도 좋은 여름 신발 추천, 베드락 샌들의 마운틴 글루</b>
      </h3>
      <p>요약 내용입니다.</p>
      <div className={cn("flex flex-col gap-[40px]", "max-sm:gap-[30px]")}>
        <span className="text-black/40 max-sm:hidden">2025.05.26</span>
        <div className="flex items-center">
          <div className="flex items-center gap-[4px]">
            <div className="h-[24px] w-[24px] rounded-full bg-slate-300" />
            <span className="text-[14px]">작가명</span>
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
            )}
          >
            2025.05.26
          </span>
        </div>
      </div>
    </div>
  );
}
