import { Skeleton } from "@seoul-moment/ui";
import { cn } from "@shared/lib/style";

const styleMap = {
  desktop: {
    section: "mx-auto flex h-[800px] max-w-[1920px] min-w-[1280px] pt-[56px]",
    image: "h-full w-[50%] object-cover",
    titleBox: "w-[50%] bg-[#F0F6FF] pt-[131px] pl-[108px]",
  },
  mobile: {
    section:
      "max-sm:flex max-sm:flex-col max-sm:max-w-auto max-sm:min-w-auto max-sm:w-full",
    image: "max-sm:w-full",
    titleBox: "max-sm:w-full max-sm:py-[40px] max-sm:px-[20px]",
    category: "",
  },
};

function ArticleDetailLoading() {
  return (
    <div>
      <section
        className={cn(styleMap.desktop.section, styleMap.mobile.section)}
      >
        <Skeleton className="h-full w-[50%] max-sm:w-full" />
        <div
          className={cn(styleMap.desktop.titleBox, styleMap.mobile.titleBox)}
        >
          <div className="mb-[40px] flex flex-col gap-[30px]">
            <div className="flex flex-col gap-[10px]">
              <Skeleton className="h-[20px] w-[120px]" />
              <Skeleton className="h-[80px] w-[220px] max-sm:h-[30px]" />
            </div>
            <Skeleton className="h-[20px] w-[120px] max-sm:h-[18px]" />
          </div>
          <div
            className={cn(
              "flex flex-col gap-[60px]",
              "max-sm:flex-row-reverse max-sm:items-center max-sm:justify-end max-sm:gap-0",
            )}
          >
            <Skeleton className="h-[20px] w-[120px]" />
            <span className="mx-[10px] hidden h-[8px] w-[1px] max-sm:block max-sm:bg-black/40" />
            <div className="flex items-center gap-[10px] max-sm:gap-[4px]">
              <Skeleton className="h-[40px] w-[40px] rounded-full max-sm:h-[24px] max-sm:w-[24px]" />
              <Skeleton className="h-[20px] w-[40px]" />
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto min-h-[1700px] w-[1280px] pt-[100px] text-center max-sm:w-full max-sm:pt-[50px]">
        <Skeleton className="h-full w-full" />
      </section>
    </div>
  );
}

export default ArticleDetailLoading;
