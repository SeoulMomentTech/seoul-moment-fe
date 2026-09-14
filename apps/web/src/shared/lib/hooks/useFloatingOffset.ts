"use client";

import { useEffect, type RefObject } from "react";

const CSS_VAR = "--floating-offset";

/**
 * 하단 고정 바의 높이를 `--floating-offset` 으로 노출한다.
 * 챗봇 런처처럼 화면 하단에 떠 있는 전역 요소가 이 값만큼 위로 올라가 바를 가리지 않는다.
 *
 * 요소가 `display: none`(데스크톱에서 숨긴 모바일 바) 이면 높이가 0 이라 오프셋도 0 이 된다 —
 * breakpoint 분기를 JS 로 따로 하지 않아도 자동으로 맞는다.
 */
export const useFloatingOffset = (ref: RefObject<HTMLElement | null>) => {
  useEffect(
    function publishOffset() {
      const element = ref.current;
      if (!element) return;

      const root = document.documentElement;
      const apply = () =>
        root.style.setProperty(CSS_VAR, `${element.offsetHeight}px`);

      apply();

      const observer = new ResizeObserver(apply);
      observer.observe(element);

      return () => {
        observer.disconnect();
        root.style.removeProperty(CSS_VAR);
      };
    },
    [ref],
  );
};
