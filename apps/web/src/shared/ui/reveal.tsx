"use client";

import type { ReactNode } from "react";

import { motion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * 세로는 뷰포트 하단에서 조금 올라온 시점에 트리거해 "이미 다 보인 뒤 늦게 움직임"을 막는다.
 *
 * 가로 마진을 크게 열어두는 이유: IntersectionObserver는 **두 축 모두** 겹쳐야
 * 발동한다. 섹션들이 `min-w-7xl`(1280px)이라 뷰포트가 그보다 좁으면 오른쪽 요소가
 * 화면 밖에 놓이고, 그러면 세로로는 지나갔는데도 트리거되지 않아 콘텐츠가
 * opacity 0으로 영구히 갇힌다(예: 768px에서 Vision 세 번째 원형).
 * 가로 위치가 진입 판정에 영향을 주지 않게 만든다.
 */
const VIEWPORT = { once: true, margin: "0px 9999px -12% 9999px" } as const;

const STAGGER_STEP = 0.08;
const STAGGER_CAP = 0.24;

type RevealVariant = "rise" | "drawX";

const VARIANTS = {
  rise: {
    hidden: { opacity: 0, y: 24 },
    shown: { opacity: 1, y: 0 },
  },
  drawX: {
    hidden: { scaleX: 0 },
    shown: { scaleX: 1 },
  },
} satisfies Record<RevealVariant, Record<"hidden" | "shown", object>>;

const DURATION = {
  rise: 0.5,
  drawX: 0.7,
} satisfies Record<RevealVariant, number>;

interface RevealProps {
  children?: ReactNode;
  className?: string;
  /**
   * 형제 항목의 순번. `STAGGER_STEP`만큼 지연되며 `STAGGER_CAP`에서 잘린다.
   * 콘텐츠가 실제로 목록일 때만 쓴다 — 스크롤되는 모든 영역을 목록처럼 다루면 안 된다.
   */
  index?: number;
  variant?: RevealVariant;
}

/**
 * 뷰포트 진입 시 1회 재생되는 진입 모션 래퍼.
 *
 * 감싸는 대신 `className`을 그대로 받아 **대상 요소 자신**이 되게 설계했다.
 * (래퍼 div를 덧붙이면 flex 아이템 구조가 바뀐다.)
 * `drawX`를 쓸 때는 호출측에서 `origin-*` 유틸리티로 기준점을 지정해야 한다.
 */
export function Reveal({
  children,
  className,
  index = 0,
  variant = "rise",
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      transition={{
        duration: DURATION[variant],
        ease: EASE,
        delay: Math.min(index * STAGGER_STEP, STAGGER_CAP),
      }}
      variants={VARIANTS[variant]}
      viewport={VIEWPORT}
      whileInView="shown"
    >
      {children}
    </motion.div>
  );
}
