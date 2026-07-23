"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { ADSENSE_CLIENT } from "@shared/constants/ads";
import { cn } from "@shared/lib/style";

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

type AdFormat = "display" | "in-article" | "in-feed";

export interface AdSenseProps {
  /** AdSense 대시보드에서 발급받은 광고 슬롯 ID (data-ad-slot) */
  slot: string;
  /** 광고 형식. 기본 "display"(반응형 디스플레이) */
  format?: AdFormat;
  /** in-feed 전용 data-ad-layout-key */
  layoutKey?: string;
  /** display 전용 전체 너비 반응형 여부. 기본 true */
  responsive?: boolean;
  /** 컨테이너 className */
  className?: string;
  /** 컨테이너 style */
  style?: CSSProperties;
}

// GA/Clarity와 동일하게 로더 스크립트는 production 에서만 로드되므로,
// 실제 광고 유닛 렌더/푸시도 production 으로 게이팅한다.
const IS_PRODUCTION = process.env.NEXT_PUBLIC_ENV === "production";

interface InsConfig {
  "data-ad-format": string;
  "data-ad-layout"?: string;
  "data-ad-layout-key"?: string;
  "data-full-width-responsive"?: string;
  style: CSSProperties;
}

function getInsConfig(
  format: AdFormat,
  layoutKey?: string,
  responsive = true,
): InsConfig {
  switch (format) {
    case "in-article":
      return {
        "data-ad-format": "fluid",
        "data-ad-layout": "in-article",
        style: { display: "block", textAlign: "center" },
      };
    case "in-feed":
      return {
        "data-ad-format": "fluid",
        "data-ad-layout-key": layoutKey,
        style: { display: "block" },
      };
    case "display":
    default:
      return {
        "data-ad-format": "auto",
        "data-full-width-responsive": String(responsive),
        style: { display: "block" },
      };
  }
}

/**
 * 공용 AdSense 광고 컴포넌트.
 * - `format` 으로 display / in-article / in-feed 를 모두 커버한다.
 * - 광고가 채워지지 않으면(no-fill, `data-ad-status="unfilled"`) 컨테이너를
 *   렌더하지 않아 빈 여백이 남지 않는다.
 * - production 이 아니면 배치 확인용 플레이스홀더를 렌더한다.
 */
export function AdSense({
  slot,
  format = "display",
  layoutKey,
  responsive = true,
  className,
  style,
}: AdSenseProps) {
  const insRef = useRef<HTMLModElement>(null);
  const [unfilled, setUnfilled] = useState(false);

  useEffect(() => {
    if (!IS_PRODUCTION) return;

    const ins = insRef.current;
    if (!ins) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // 로더 스크립트가 아직 준비되지 않은 경우 조용히 무시한다.
    }

    const syncStatus = () => {
      if (ins.getAttribute("data-ad-status") === "unfilled") {
        setUnfilled(true);
      }
    };
    syncStatus();

    const observer = new MutationObserver(syncStatus);
    observer.observe(ins, {
      attributes: true,
      attributeFilter: ["data-ad-status"],
    });

    return () => observer.disconnect();
    // 마운트 시 1회만 push 한다. props 변경으로 재푸시하지 않는다.
  }, []);

  // no-fill: 잡아둔 영역을 제거한다.
  if (unfilled) return null;

  // dev/비프로덕션: 실제 광고 대신 배치 확인용 플레이스홀더.
  if (!IS_PRODUCTION) {
    return (
      <div
        className={cn(
          "flex min-h-[90px] items-center justify-center border border-dashed border-gray-300 text-xs text-gray-400",
          className,
        )}
        style={style}
      >
        {`AdSense · ${format} · slot ${slot}`}
      </div>
    );
  }

  // production 인데 슬롯이 아직 발급되지 않았으면 빈 유닛을 만들지 않는다.
  if (!slot) return null;

  const config = getInsConfig(format, layoutKey, responsive);

  return (
    <div className={className} style={style}>
      <ins
        className="adsbygoogle"
        data-ad-client={ADSENSE_CLIENT}
        data-ad-format={config["data-ad-format"]}
        data-ad-layout={config["data-ad-layout"]}
        data-ad-layout-key={config["data-ad-layout-key"]}
        data-ad-slot={slot}
        data-full-width-responsive={config["data-full-width-responsive"]}
        ref={insRef}
        style={config.style}
      />
    </div>
  );
}
