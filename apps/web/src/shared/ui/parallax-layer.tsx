"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { motion, useScroll, useTransform } from "motion/react";

interface ParallaxLayerProps {
  children: ReactNode;
  className?: string;
  /**
   * 뷰포트를 통과하는 동안 위아래로 움직이는 거리(px). 총 이동량은 이 값의 2배다.
   * 내부 요소에 그만큼의 bleed(예: `scale-[1.05]`)가 있어야 빈틈이 생기지 않고,
   * 조상 섹션에는 `overflow-clip`이 필요하다.
   */
  drift?: number;
}

/**
 * 스크롤 진행률에 연동해 배경 레이어를 미세하게 움직인다.
 *
 * `overflow-hidden`이 아니라 **`overflow-clip`** 을 쓸 것 — `hidden`은 스크롤
 * 컨테이너를 만들어 스크롤 위치 측정 기준을 바꿔버린다.
 *
 * 마운트 이후에만 켜지는 이유가 둘 있다.
 * 1. SSR HTML과 첫 클라이언트 렌더의 style이 같아야 hydration 불일치가 없다.
 * 2. `style`에 MotionValue를 직접 바인딩하는 건 애니메이션이 아니라서
 *    `MotionConfig reducedMotion="user"`가 잡아주지 않는다 — 여기서 직접 끈다.
 */
export function ParallaxLayer({
  children,
  className,
  drift = 20,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-drift, drift]);

  useEffect(() => {
    setIsEnabled(
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  return (
    <motion.div
      className={className}
      ref={ref}
      style={isEnabled ? { y } : undefined}
    >
      {children}
    </motion.div>
  );
}
