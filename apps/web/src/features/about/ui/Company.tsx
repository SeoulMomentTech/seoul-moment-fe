import Image from "next/image";
import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";

const data = [
  {
    id: "A",
    title: "Identity",
    contents: "identity_contents",
  },
  {
    id: "B",
    title: "Storyteller",
    contents: "storyteller_contents",
  },
  {
    id: "C",
    title: "Connector",
    contents: "connector_contents",
  },
];

export function Company() {
  const t = useTranslations();
  return (
    <section className="relative min-w-[1280px] px-[20px] max-sm:min-w-full max-sm:px-0">
      <div
        className={cn(
          "mx-auto max-w-[1280px] py-[140px]",
          "max-sm:w-full max-sm:px-[20px] max-sm:pb-[72px] max-sm:pt-[50px]",
        )}
      >
        <h2
          className={cn(
            "text-title-2 mb-[80px] font-bold",
            "max-sm:text-title-3 max-sm:mb-[60px]",
          )}
        >
          SeoulMoment Company.
        </h2>
        <div className={cn("flex flex-col gap-[40px]")}>
          {data.map((item) => (
            <div
              className={cn(
                "flex h-[96px] justify-between border-b border-b-white/5 pb-[40px]",
                "max-sm:h-auto max-sm:flex-col max-sm:gap-[20px]",
              )}
              key={item.id}
            >
              <div
                className={cn(
                  "flex items-center gap-[20px]",
                  "max-sm:gap-[8px]",
                )}
              >
                <div
                  className={cn(
                    "flex h-[40px] w-[40px] items-center justify-center rounded-full bg-black text-white",
                    "max-sm:h-[28px] max-sm:w-[28px]",
                  )}
                >
                  <span className="text-title-4 max-sm:text-body-3 font-bold">
                    {item.id}
                  </span>
                </div>
                <span className="text-title-3 max-sm:text-title-4 font-bold">
                  {item.title}
                </span>
              </div>
              <p
                className={cn(
                  "text-title-4 w-[790px] font-medium",
                  "max-sm:text-body-3 max-sm:w-auto",
                )}
              >
                {t(item.contents)}
              </p>
            </div>
          ))}
        </div>
      </div>
      <figure className="absolute bottom-0 right-0">
        <Image alt="" height={372} src="/about/bg-layer.png" width={802} />
      </figure>
    </section>
  );
}
