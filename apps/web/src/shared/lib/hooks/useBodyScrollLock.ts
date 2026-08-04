import { useEffect } from "react";

/**
 * locked가 true인 동안 body 스크롤을 잠근다.
 * 잠글 조건(모바일 여부 등)은 호출부에서 결정한다.
 */
export default function useBodyScrollLock(locked: boolean) {
  useEffect(
    function lockBodyScroll() {
      if (!locked) return;

      const { overflow, touchAction } = document.body.style;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";

      return function restoreBodyScroll() {
        document.body.style.overflow = overflow;
        document.body.style.touchAction = touchAction;
      };
    },
    [locked],
  );
}
