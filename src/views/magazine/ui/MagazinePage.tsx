import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared/lib/style";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
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
      >
        <Tabs
          className="border-b border-b-black/10 max-sm:pl-[20px]"
          defaultValue="all"
        >
          <TabsList className="flex h-[50px] items-center gap-[30px]">
            <TabsTrigger className="text-[18px]" value="all">
              All
            </TabsTrigger>
            <TabsTrigger className="text-[18px]" value="fashion">
              Fashion
            </TabsTrigger>
            <TabsTrigger className="text-[18px]" value="beauty">
              Beauty
            </TabsTrigger>
            <TabsTrigger className="text-[18px]" value="accessories">
              Accessories
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mt-[40px] mb-[20px] flex justify-between max-sm:px-[20px]">
          <span>총 1,002,622</span>
          <div className="flex gap-[4px]">
            인기순
            <ChevronDown height={16} width={16} />
          </div>
        </div>
        <div className="min-h-[1344px] bg-slate-300 max-sm:min-h-[560px]" />
        <div
          className={cn(
            "mt-[32px] flex items-center justify-center",
            "max-sm:mt-[28px] max-sm:px-[20px]",
          )}
        >
          <Button
            className={cn(
              "rounded-[4px] border border-black/20 bg-white px-[20px] py-[16px] text-black",
              "cursor-pointer hover:bg-white",
              "max-sm:w-full",
            )}
          >
            더보기
          </Button>
        </div>
      </SectionWithLabel>
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
