import { cn } from "@/shared/lib/style";
import { HotKeywordList } from "@/widgets/hot-list";
import LifeStyleList from "@/widgets/lifestyle-list/ui/LifeStyleList";
import { SectionWithLabel } from "@/widgets/section-with-label";

export function NewsPage() {
  return (
    <section>
      <section
        className={cn(
          "mx-auto mt-[106px] mb-[100px] flex h-[480px] w-[1280px] gap-[40px]",
          "max-sm:h-auto max-sm:w-full max-sm:flex-col max-sm:gap-[50px]",
          "max-sm:mt-[56px]",
        )}
      >
        <div
          className={cn(
            "w-[738px] bg-slate-300",
            "max-sm:h-[600px] max-sm:w-full",
          )}
        />
        <div
          className={cn("flex flex-1 flex-col gap-[30px]", "max-sm:px-[20px]")}
        >
          <h2 className="text-title-2 max-sm:text-title-4 font-bold">
            News Update
          </h2>
          <div className="h-ful flex h-[428px] w-full flex-1 flex-col gap-[20px] overflow-auto">
            <div className="flex gap-[20px] border-b border-b-black/10 pb-[20px]">
              <div className="h-[90px] w-[90px] bg-slate-300" />
              <div className="flex flex-col justify-center gap-[10px]">
                <span className="text-body-4">SNEAKERS</span>
                <p className="text-body-2 font-semibold">
                  사계절 신어도 좋은 여름 신발 추천, 베드락 샌들의 마운틴 글루
                </p>
              </div>
            </div>
            <div className="flex gap-[20px] border-b border-b-black/10 pb-[20px]">
              <div className="h-[90px] w-[90px] bg-slate-300" />
              <div className="flex flex-col justify-center gap-[10px]">
                <span className="text-body-4">SNEAKERS</span>
                <p className="text-body-2 font-semibold">
                  사계절 신어도 좋은 여름 신발 추천, 베드락 샌들의 마운틴 글루
                </p>
              </div>
            </div>
            <div className="flex gap-[20px] border-b border-b-black/10 pb-[20px]">
              <div className="h-[90px] w-[90px] bg-slate-300" />
              <div className="flex flex-col justify-center gap-[10px]">
                <span className="text-body-4">SNEAKERS</span>
                <p className="text-body-2 font-semibold">
                  사계절 신어도 좋은 여름 신발 추천, 베드락 샌들의 마운틴 글루
                </p>
              </div>
            </div>
            <div className="flex gap-[20px] border-b border-b-black/10 pb-[20px]">
              <div className="h-[90px] w-[90px] bg-slate-300" />
              <div className="flex flex-col justify-center gap-[10px]">
                <span className="text-body-4">SNEAKERS</span>
                <p className="text-body-2 font-semibold">
                  사계절 신어도 좋은 여름 신발 추천, 베드락 샌들의 마운틴 글루
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <SectionWithLabel
        className={cn(
          "mx-auto mb-[103px] w-[1280px]",
          "max-sm:w-full max-sm:px-[20px]",
        )}
        label={
          <h2 className="text-title-2 max-sm:text-title-4 mb-[30px] font-bold">
            Editor’s Pick
          </h2>
        }
      >
        <div className="h-[321px] bg-slate-300" />
      </SectionWithLabel>
      <section
        className={cn(
          "mx-auto mb-[100px] h-[618px] w-full max-w-[1920px] min-w-[1280px] bg-black py-[100px]",
          "max-sm:mb-[50px] max-sm:h-[511px] max-sm:max-w-none max-sm:min-w-full max-sm:flex-col",
          "max-sm:px-[20px] max-sm:py-[50px]",
        )}
      >
        <div
          className={cn(
            "mx-auto flex w-[1280px] gap-[130px]",
            "max-sm:w-full max-sm:flex-col max-sm:gap-[40px]",
          )}
        >
          <div
            className={cn(
              "flex flex-col gap-[30px] text-white",
              "max-sm:gap-[10px]",
            )}
          >
            <span className="max-sm:text-body-3">Hot Keyword</span>
            <h3 className="text-title-1 max-sm:text-title-3 font-bold">
              #직장생활
            </h3>
          </div>
          <div
            className={cn(
              "h-[418px] w-[951px]",
              "max-sm:h-auto max-sm:w-full max-sm:overflow-x-auto",
            )}
          >
            <HotKeywordList />
          </div>
        </div>
      </section>
      <SectionWithLabel
        className={cn(
          "mx-auto mb-[100px] w-[1280px]",
          "max-sm:w-full max-sm:px-[20px]",
        )}
        label={
          <h2 className="text-title-2 max-sm:text-title-4 mb-[30px] font-bold max-sm:mb-[20px]">
            Lifestyle
          </h2>
        }
      >
        <LifeStyleList />
      </SectionWithLabel>
    </section>
  );
}
