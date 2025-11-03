import Image from "next/image";
import { cn } from "@shared/lib/style";

const data = [
  {
    title: "Platform",
    contents:
      "한국의 브랜드의 전략적 진출과 대만 소비자의 감각적인 소비를 연결하는 K-라이프스타일 플랫폼",
  },
  {
    title: "Trend Magazine",
    contents:
      "자사 트렌드 매거진 제도를 기반으로 한국기업의 대만 진출 기회 확보, 대만 소비 시장 구매 다양성 제공",
  },
  {
    title: "Data Analysis",
    contents:
      "대만 사용자 구매동향 및 트렌드 분석 한국 기업의 브랜드 전략을 결합하여 새로운 데이터 분석 전략",
  },
];

export function Vision() {
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
          "absolute bottom-[37%] h-[1px] w-full bg-white/20",
          "max-sm:hidden",
        )}
      />
      <div className={cn("relative z-[1] px-[20px]", "mx-auto max-w-[1280px]")}>
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
          서울 모먼트는 한국 브랜드의 감성을 글로벌 시장에 맞춰 큐레이션하고{" "}
          <br className="max-sm:hidden" />
          대만 소비자에게 트렌드를 감각적으로 경험하게 하는 K-라이프 스타일
          플랫폼입니다.
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
                {item.title}
              </h4>
              <p className="max-sm:text-body-3 text-center">{item.contents}</p>
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
