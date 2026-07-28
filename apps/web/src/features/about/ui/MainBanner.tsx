import Image from "next/image";

import { cn } from "@shared/lib/style";
import { ParallaxLayer } from "@shared/ui/parallax-layer";

export function MainBanner() {
  return (
    /*
     * overflow-clip이어야 한다 — overflow-hidden은 스크롤 컨테이너를 만들어
     * 내부 ParallaxLayer의 스크롤 진행률 측정 기준을 바꿔버린다.
     */
    <section
      className={cn(
        "min-w-7xl relative h-[600px] overflow-clip pt-14",
        "max-sm:min-w-full",
      )}
    >
      {/* top-14로 기존 pt-14 기준 위치(56px~600px)를 그대로 유지한다. */}
      <ParallaxLayer className="absolute inset-x-0 bottom-0 top-14" drift={10}>
        <Image
          alt=""
          /*
           * scale-[1.04]는 drift가 움직일 여백(bleed)이고,
           * shutter-settle은 transform: scale()이라 그 위에 곱셈 합성된다.
           * transform만 건드리므로 LCP 페인트 시점은 그대로다.
           */
          className="shutter-settle h-full scale-[1.04] object-cover"
          height={727}
          preload
          src="/about/seoul.webp"
          width={4000}
        />
      </ParallaxLayer>
      <figure
        className={cn(
          "absolute flex h-full w-full items-center justify-center",
          "max-sm:px-5",
        )}
      >
        {/*
         * 워드마크가 실제 시각적 LCP 후보다. 와이프가 사진 페인트보다 먼저
         * 끝나 "툭" 나타나지 않도록 preload를 함께 준다(511x60 PNG, 12KB).
         * 토큰에 140ms delay + fill-mode both가 들어 있어 지연 구간에도
         * 클립된 상태가 유지된다 — both가 없으면 먼저 보였다 사라지는 플래시가 난다.
         */}
        <Image
          alt="seoul moment"
          className="wordmark-wipe"
          height={60}
          preload
          src="/about/seoul-moment.png"
          width={511}
        />
      </figure>
    </section>
  );
}
