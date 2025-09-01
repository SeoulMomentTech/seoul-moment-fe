import Link from "next/link";
import { cn } from "@/shared/lib/style";
import { NewsList } from "@/widgets/news-list";
import { SectionWithLabel } from "@/widgets/section-with-label";

export function MagazinePage() {
  return (
    <section className={cn("mx-auto w-[1280px] pt-[96px]", "max-sm:w-full")}>
      <div
        className={cn(
          "flex h-[754px] gap-[40px]",
          "max-sm:h-auto max-sm:flex-col",
        )}
      >
        <div
          className={cn(
            "w-[630px] bg-slate-300",
            "max-sm:h-[744px] max-sm:w-full",
          )}
        />
        <div
          className={cn(
            "flex flex-col gap-[100px]",
            "max-sm:gap-0 max-sm:px-[20px]",
          )}
        >
          <div
            className={cn(
              "flex gap-[30px]",
              "max-sm:flex-col max-sm:py-[20px]",
            )}
          >
            <div
              className={cn(
                "h-[327px] w-[305px] bg-slate-300",
                "max-sm:h-[202px] max-sm:w-full",
              )}
            />
            <div className="flex w-[275px] flex-col justify-center gap-[20px]">
              <div>
                <span>SNEAKERS</span>
              </div>
              <h3>
                <b>
                  사계절 신어도 좋은 여름 신발 추천, 베드락 샌들의 마운틴 글루
                </b>
              </h3>
              <p>요약 내용입니다.</p>
              <div className="flex flex-col gap-[40px]">
                <span className="text-black/40">2025.05.26</span>
                <div className="flex items-center gap-[4px]">
                  <div className="h-[24px] w-[24px] rounded-full bg-slate-300" />
                  <span className="text-[14px]">작가명</span>
                </div>
              </div>
            </div>
          </div>
          <div
            className={cn(
              "flex flex-row-reverse gap-[30px]",
              "max-sm:flex-col max-sm:py-[20px]",
            )}
          >
            <div
              className={cn(
                "h-[327px] w-[305px] bg-slate-300",
                "max-sm:h-[202px] max-sm:w-full",
              )}
            />
            <div className="flex w-[275px] flex-col justify-center gap-[20px]">
              <div>
                <span>SNEAKERS</span>
              </div>
              <h3>
                <b>
                  사계절 신어도 좋은 여름 신발 추천, 베드락 샌들의 마운틴 글루
                </b>
              </h3>
              <p>요약 내용입니다.</p>
              <div className="flex flex-col gap-[40px]">
                <span className="text-black/40">2025.05.26</span>
                <div className="flex items-center gap-[4px]">
                  <div className="h-[24px] w-[24px] rounded-full bg-slate-300" />
                  <span className="text-[14px]">작가명</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SectionWithLabel
        className="pt-[140px] pb-[100px]"
        label={
          <div className={cn("mb-[30px]", "max-sm:mb-[20px] max-sm:px-[20px]")}>
            <h3 className={cn("text-[32px]", "max-sm:text-[20px]")}>
              <b>LOOKBOOK</b>
            </h3>
          </div>
        }
      />
      <SectionWithLabel
        className={cn("py-[100px]", "max-sm:px-[20px]")}
        label={
          <div
            className={cn(
              "mb-[30px] flex w-full items-end justify-between",
              "max-sm:mb-[20px]",
            )}
          >
            <h3 className={cn("text-[32px]", "max-sm:text-[20px]")}>
              <b>NEWS & Article</b>
            </h3>
            <Link
              className={cn(
                "text-[14px] hover:underline",
                "max-sm:text-[13px]",
              )}
              href="/"
            >
              More
            </Link>
          </div>
        }
      >
        <NewsList />
      </SectionWithLabel>
    </section>
  );
}
