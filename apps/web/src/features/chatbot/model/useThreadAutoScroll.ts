"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { PINNED_THRESHOLD_PX } from "./constants";

interface ThreadAutoScrollOptions {
  /** 높이를 바꾸는 모든 신호. 메시지 수, 마지막 id, 대기 상태. */
  deps: unknown[];
}

interface ThreadAutoScroll {
  hasNewBelow: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  handleScroll(): void;
  jumpToNewest(): void;
}

/**
 * 하단 고정 스크롤. "새 메시지는 따라가되, 히스토리를 읽는 중이면 끌어내리지
 * 않는다".
 */
export const useThreadAutoScroll = ({
  deps,
}: ThreadAutoScrollOptions): ThreadAutoScroll => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const [hasNewBelow, setHasNewBelow] = useState(false);

  const measure = useCallback((el: HTMLDivElement) => {
    // 등식(=== 0) 비교는 안 된다. 비정수 DPR·브라우저 줌에서 scrollTop 은
    // 소수이고 엔진마다 반올림이 다르다. 56px ≈ 본문 한 줄이라 "마지막 메시지를
    // 읽고 있는" 상태도 고정으로 인정된다.
    return (
      el.scrollHeight - el.scrollTop - el.clientHeight <= PINNED_THRESHOLD_PX
    );
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    pinnedRef.current = measure(el);
    if (pinnedRef.current) setHasNewBelow(false);
  }, [measure]);

  /*
   * useLayoutEffect 여야 한다 — useEffect 면 스크롤 전 위치가 한 프레임 보인다.
   *
   * pinned 판정은 **DOM 변경 전에** 잡아둔 pinnedRef 를 쓴다. 노드가 추가된
   * 뒤에는 scrollHeight 가 이미 커져 있어 지금 측정하면 항상 "고정 아님" 이 된다.
   *
   * scrollIntoView 를 쓰지 않는다: 조상 스크롤러를 문서까지 포함해 전부
   * 스크롤하므로, 비모달 데스크탑 패널에서는 답변마다 하위 페이지가 튄다.
   */
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (pinnedRef.current) {
      // behavior: "auto"(즉시). 연속 append 중 smooth 는 큐잉·취소되며
      // 고장난 것처럼 보인다.
      el.scrollTop = el.scrollHeight;
      setHasNewBelow(false);
    } else {
      setHasNewBelow(true);
    }
    // deps 는 호출부가 조립한다(메시지 수/마지막 id/대기 상태).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  /*
   * 렌더 이후에 높이가 또 변하는 경우를 잡는다. React 의 layout effect 만으로는
   * 부족하다 — 카드 레일 이미지 로드, 스켈레톤→본문 교체, 폰트 스왑, 그리고
   * 짧은 대화를 아래로 붙이는 `mt-auto` 가 풀리는 순간이 전부 effect **이후**에
   * 높이를 바꾼다. (실측: 상품 카드 답변 직후 38px 이 더 자라 하단이 잘렸다.)
   *
   * 고정 상태일 때만 따라간다 — 히스토리를 읽는 중인 사용자를 끌어내리지 않는다.
   */
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      if (!pinnedRef.current) return;
      el.scrollTop = el.scrollHeight;
    });

    // 스크롤 컨테이너 자신이 아니라 내용물을 관찰한다 — 컨테이너 높이는
    // 고정이고 변하는 쪽은 내용물이다.
    Array.from(el.children).forEach((child) => observer.observe(child));

    return () => observer.disconnect();
    // 자식이 교체되는 시점(빈 상태 ↔ 목록)에 다시 붙어야 한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const jumpToNewest = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    // 명시적 클릭에서만 smooth. reduced-motion 은 호출 시점에 읽는다 —
    // useReducedMotion() 으로 렌더 분기하면 하이드레이션이 어긋난다(DESIGN.md §7).
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    el.scrollTo({
      behavior: prefersReduced ? "auto" : "smooth",
      top: el.scrollHeight,
    });
    pinnedRef.current = true;
    setHasNewBelow(false);
  }, []);

  return { handleScroll, hasNewBelow, jumpToNewest, scrollRef };
};
