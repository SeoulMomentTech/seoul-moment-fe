"use client";

import type { ReactNode } from "react";

import { MotionConfig } from "motion/react";

interface MotionProviderProps {
  children: ReactNode;
}

/**
 * motion 애니메이션의 접근성 정책을 잡는 경계.
 *
 * `reducedMotion="user"`는 `prefers-reduced-motion: reduce`일 때
 * transform 계열 값(y, scaleX 등)을 즉시 목표값으로 적용하고 opacity만 보간한다.
 * `useReducedMotion()`으로 렌더 분기하면 SSR(null)과 첫 클라이언트 렌더(true)가
 * 어긋나 hydration 불일치가 나므로, 라이브러리 내부 정책에 맡긴다.
 *
 * 루트 레이아웃이 아니라 모션을 쓰는 화면에서만 감싼다 — 그래야
 * 다른 라우트가 motion 번들을 지불하지 않는다.
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
