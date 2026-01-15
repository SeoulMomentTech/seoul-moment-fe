import Image from "next/image";
import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";

const data = [
  {
    title: "platform",
    contents: "platform_contents",
  },
  {
    title: "trend_magazine",
    contents: "trend_magazine_contents",
  },
  {
    title: "data_analysis",
    contents: "data_analysis_contents",
  },
];

export function Vision() {
  const t = useTranslations();

  return (
    <section
      className={cn(
        "relative h-[880px] w-full min-w-[1280px] bg-black py-[140px]",
        "max-sm:h-auto max-sm:min-w-full max-sm:py-[50px]",
        "text-white",
      )}
    >
      <div
        className={cn(
          "absolute bottom-[37%] h-px w-full bg-white/20",
          "max-sm:hidden",
        )}
      />
      <div className={cn("z-1 relative px-[20px]", "mx-auto max-w-[1280px]")}>
        <h2
          className={cn(
            "text-title-2 mb-[60px] font-bold",
            "max-sm:text-title-3 max-sm:mb-[40px]",
          )}
        >
          VISION
        </h2>
        <h3
          className={cn(
            "text-title-3 mb-[124px] text-center font-bold",
            "max-sm:text-body-3 max-sm:mb-[118px] max-sm:text-start max-sm:font-semibold",
          )}
        >
          {t("vision_title1")}
          <br className="max-sm:hidden" />
          {t("vision_title2")}
        </h3>
        <div
          className={cn(
            "flex justify-center gap-[30px]",
            "max-sm:flex-col max-sm:items-center max-sm:gap-[16px]",
          )}
        >
          {data.map((item) => (
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-full border border-white/50",
                "h-[300px] w-[300px] gap-[50px] px-[24px]",
                "max-sm:px-[18px]] max-sm:h-[250px] max-sm:w-[250px] max-sm:gap-[30px]",
              )}
              key={item.title}
            >
              <h4 className="text-title-3 max-sm:text-body-1 font-bold">
                {t(item.title)}
              </h4>
              <p className="max-sm:text-body-3 text-center">
                {t(item.contents)}
              </p>
            </div>
          ))}
        </div>
      </div>
      <figure
        className={cn(
          "absolute opacity-45",
          "right-[50%] top-[38%] translate-x-[50%]",
          "max-sm:top-[20%] max-sm:w-full",
        )}
      >
        <Image alt="" height={198} src="/about/earth.png" width={816} />
      </figure>
    </section>
  );
}
