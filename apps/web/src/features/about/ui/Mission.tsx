import Image from "next/image";
import { cn } from "@shared/lib/style";

const data = [
  {
    id: 1,
    title: "서울의 감각과 스토리",
    contents:
      "Identity·Storyteller 요소 반영 (한남동·압구정·성수·홍대의 트렌드 감성)",
  },
  {
    id: 2,
    title: "데이터와 콘텐츠로 연결",
    contents: "Data Analysis + Trend Magazine 전략을 통합",
  },
  {
    id: 3,
    title: "대만 소비자에게 가장 빠르고 진정성 있는 경험 제공",
    contents: " Platform 목표와 글로벌 확장성 반영",
  },
];

export function Mission() {
  return (
    <section
      className={cn(
        "relative h-[814px] min-w-[1280px] text-white",
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
          "relative z-[1] mx-auto max-w-[1280px] px-[20px] py-[140px] max-sm:py-[50px]",
        )}
      >
        <h2
          className={cn(
            "text-title-2 mb-[80px] font-bold",
            "max-sm:text-title-3 max-sm:mb-[40px]",
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
            서울의 감각과 스토리를 데이터와 콘텐츠로 연결해, 대만 소비자에게
            가장 빠르고 진정성 있는 K-라이프 스타일 경험을 제공한다.
          </h3>
          <div className="flex flex-col gap-[40px]">
            {data.map((item) => (
              <div
                className={cn(
                  "flex w-[570px] flex-col gap-[30px] border-b border-b-white/20 pb-[40px]",
                  "max-sm:w-auto",
                )}
                key={`mission-${item.id}`}
              >
                <div className="text-title-3 max-sm:text-title-4 flex gap-[20px] font-bold">
                  <span>0{item.id}</span>
                  <h4>{item.title}</h4>
                </div>
                <p className="text-title-4 max-sm:text-body-3">
                  {item.contents}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
