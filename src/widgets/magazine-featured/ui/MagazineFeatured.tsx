import { MagazineMainCard } from "@entities/magazine";
import { MagazineCardInfo } from "@entities/magazine/ui/MagazineCardInfo";
import { cn } from "@shared/lib/style";

export function MagazineFeatured() {
  return (
    <div
      className={cn(
        "flex h-[754px] gap-[40px]",
        "max-sm:h-auto max-sm:flex-col",
      )}
    >
      <div
        className={cn(
          "flex w-[630px] flex-col justify-end bg-slate-200 px-[30px] py-[50px]",
          "max-sm:h-[744px] max-sm:w-full max-sm:px-[20px] max-sm:py-[40px]",
        )}
      >
        <MagazineCardInfo className="w-full" size="large" textColor="white" />
      </div>
      <div
        className={cn(
          "flex flex-col gap-[100px]",
          "max-sm:gap-0 max-sm:px-[20px]",
        )}
      >
        <MagazineMainCard />
        <MagazineMainCard direction="row-reverse" />
      </div>
    </div>
  );
}
