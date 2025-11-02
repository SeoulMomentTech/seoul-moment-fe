import Image from "next/image";
import { cn } from "@shared/lib/style";

const data = [
  {
    id: "A",
    title: "Identity",
    contents:
      "서울모먼트는 서울의 대표 지역인 HASH(한남동, 압구정, 성수, 홍대)의 고유한 지역감성을 기반으로 설립된 글로벌 스타일 플랫폼입니다.",
  },
  {
    id: "B",
    title: "Storyteller",
    contents:
      "서울모먼트는 플랫폼과 브랜드 매거진을 통해 한국의 브랜드의 대만 진출을 목적으로 하며, 각 브랜드의 정체성과 스토리를 세련된 방식으로 현지 소비자에게 전달합니다.",
  },
  {
    id: "C",
    title: "Connector",
    contents:
      "서울의 현대적인 모던함을 전 세계에 알리고, 한국과 대만 간 다양한 스타일 (패션, 뷰티, 라이프스타일) 분야의 비즈니스 교류를 촉진하는 것을 목표로 하고 있습니다.",
  },
];

export function Company() {
  return (
    <section className="relative min-w-[1280px] px-[20px] max-sm:min-w-full max-sm:px-0">
      <div
        className={cn(
          "mx-auto max-w-[1280px] py-[140px]",
          "max-sm:w-full max-sm:px-[20px] max-sm:pt-[50px] max-sm:pb-[72px]",
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
                {item.contents}
              </p>
            </div>
          ))}
        </div>
      </div>
      <figure className="absolute right-0 bottom-0">
        <Image alt="" height={372} src="/about/bg-layer.png" width={802} />
      </figure>
    </section>
  );
}
