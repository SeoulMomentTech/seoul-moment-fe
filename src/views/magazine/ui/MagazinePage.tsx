import Link from "next/link";
import { cn } from "@/shared/lib/style";
import { MagazineFeatured } from "@/widgets/magazine-featured";
import { NewsList } from "@/widgets/news-list";
import { SectionWithLabel } from "@/widgets/section-with-label";

export function MagazinePage() {
  return (
    <section className={cn("mx-auto w-[1280px] pt-[56px]", "max-sm:w-full")}>
      <MagazineFeatured />
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
