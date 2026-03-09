import Image from "next/image";
import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";

const data = [
  {
    id: 1,
    title: "mission_subtitle_1",
    contents: "mission_subtitle_description_1",
  },
  {
    id: 2,
    title: "mission_subtitle_2",
    contents: "mission_subtitle_description_2",
  },
  {
    id: 3,
    title: "mission_subtitle_3",
    contents: "mission_subtitle_description_3",
  },
];

export function Mission() {
  const t = useTranslations();
  return (
    <section
      className={cn(
        "min-w-7xl relative min-h-[814px] text-white",
        "max-sm:h-auto max-sm:min-w-full",
      )}
    >
      <Image
        alt=""
        className="absolute h-full object-cover"
        height={814}
        src="/about/mission.webp"
        width={4000}
      />
      <div
        className={cn(
          "z-1 relative mx-auto max-w-7xl px-5 py-[140px] max-sm:py-[50px]",
        )}
      >
        <h2
          className={cn(
            "text-title-2 mb-20 font-bold",
            "max-sm:text-title-3 max-sm:mb-10",
          )}
        >
          Mission
        </h2>
        <div
          className={cn(
            "flex justify-between",
            "max-sm:flex-col max-sm:gap-[60px]",
          )}
        >
          <h3
            className={cn(
              "text-title-3 w-[522px] font-bold",
              "max-sm:text-body-3 max-sm:w-auto",
            )}
          >
            {t("mission_description")}
          </h3>
          <div className="flex flex-col gap-10">
            {data.map((item) => (
              <div
                className={cn(
                  "flex w-[570px] flex-col gap-[30px] border-b border-b-white/20 pb-10",
                  "max-sm:w-auto",
                )}
                key={`mission-${item.id}`}
              >
                <div className="text-title-3 max-sm:text-title-4 flex gap-5 font-bold">
                  <span>0{item.id}</span>
                  <h4>{t(item.title)}</h4>
                </div>
                <p className="text-title-4 max-sm:text-body-3">
                  {t(item.contents)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
