"use client";

import { useEffect, useRef } from "react";

/*
 * 가상 키보드 보정.
 *
 * 이 앱에는 generateViewport / export const viewport 가 없어서 Next 기본값
 * (`width=device-width, initial-scale=1`, interactive-widget 미지정 = resizes-visual)
 * 이 적용된다. 그 모드에서는 **레이아웃 뷰포트가 줄지 않으므로** 100vh / 100dvh /
 * `fixed bottom-0` 이 전부 키보드에 반응하지 않고, Chrome Android 에서는 컴포저가
 * 키보드 뒤로 들어간다. iOS Safari 는 interactive-widget 자체를 무시한다.
 *
 * `interactive-widget=resizes-content` 를 넣으면 상당 부분 해결되지만 그건 전역
 * 변경이고 layout.tsx 의 `min-h-[calc(100vh-200px)]`, vaul 줌 모달, FilterSheet,
 * Search, PhoneVerificationModal, UserSizeInfoModal, terms-modal 전부에 영향한다.
 * 별도 회귀 패스가 필요한 별도 PR이므로, 여기서는 iOS·Android 양쪽에 동일하게
 * 동작하고 전역 메타를 건드리지 않는 visualViewport 방식을 쓴다.
 */
export const useVisualViewportInset = (isActive: boolean) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const viewport = typeof window !== "undefined" && window.visualViewport;

    // visualViewport 가 없으면 그냥 100dvh 로 degrade 한다.
    if (!el || !isActive || !viewport) return;

    let frame = 0;

    const sync = () => {
      cancelAnimationFrame(frame);
      // iOS 는 스크롤 중 고빈도로 발화하므로 rAF 로 스로틀한다.
      frame = requestAnimationFrame(() => {
        const inset = Math.max(
          0,
          window.innerHeight - viewport.height - viewport.offsetTop,
        );

        el.style.setProperty("--chat-kb", `${inset}px`);
        // iOS 는 리사이즈 없이 시각 뷰포트만 오프셋시키므로 그만큼 따라간다.
        el.style.transform = `translateY(-${viewport.offsetTop}px)`;
      });
    };

    sync();
    // resize 만으로는 부족하다 — iOS 는 오프셋 변화를 scroll 로 던진다.
    viewport.addEventListener("resize", sync);
    viewport.addEventListener("scroll", sync);

    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", sync);
      viewport.removeEventListener("scroll", sync);
      el.style.removeProperty("--chat-kb");
      el.style.transform = "";
    };
  }, [isActive]);

  return ref;
};
