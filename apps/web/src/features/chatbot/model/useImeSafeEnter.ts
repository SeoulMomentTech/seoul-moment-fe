"use client";

import { useCallback, useRef, type KeyboardEvent } from "react";

/*
 * 한글/중문 IME 안전 Enter 가드.
 *
 * 이 저장소에는 isComposing 처리가 한 곳도 없고, packages/ui 의 search-bar.tsx 에
 * 이미 같은 버그가 살아 있다(조합 확정 Enter 가 곧바로 검색을 실행한다).
 *
 * 왜 `e.nativeEvent.isComposing` 인가 —
 * React 의 합성 KeyboardEvent 는 isComposing 을 노출하지 않는다(@types/react
 * 확인). `e.isComposing` 은 타입 에러이고, `(e as any).isComposing` 은 조용히
 * undefined 가 되어 가드가 영구히 미작동한다. 이 기능이 깨져 배포되는 가장
 * 흔한 경로다.
 *
 * 왜 keydown 인가 —
 * (1) 개행 삽입을 막으려면 preventDefault 가 필요하고 keydown 에서만 가능하다.
 * (2) keyup 시점에는 모든 엔진에서 isComposing 이 이미 false 라 "조합을 확정한
 *     Enter" 와 "전송하려는 Enter" 를 구별할 수 없다 — 원리적으로 수정 불가.
 *
 * 왜 composingRef + rAF 도 필요한가 —
 * macOS Safari(WebKit) 는 확정 Enter 의 keydown **이전에** compositionend 를
 * 던진다. 그 순간 isComposing 은 false 라 네이티브 플래그만으로는 뚫린다.
 * compositionend 에서 즉시 지우지 않고 다음 프레임에 지우면, 같은 태스크에
 * 도착한 확정 keydown 이 아직 조합 중으로 판정된다.
 *
 * keyCode 229 / key "Process" 는 레거시 Windows IME 와 Android GBoard 가 쓰는
 * 신호다. 이 검사는 `key !== "Enter"` 보다 **먼저** 와야 한다 — 해당 케이스에서
 * key 가 "Process"/"Unidentified" 로 오기 때문이다.
 */

interface ImeSafeEnterOptions {
  /** 터치 기기에서는 Enter 전송을 끈다(Android IME 실패군 전체가 사라진다). */
  enabled: boolean;
  onSubmit(): void;
}

interface ImeSafeEnterHandlers {
  /** 조합 중인지 여부를 읽는다. 길이 제한·값 변환을 막는 데 쓴다. */
  isComposingRef: { readonly current: boolean };
  onCompositionEnd(): void;
  onCompositionStart(): void;
  onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void;
}

/** 조합 중인 Enter/Esc 인지 판정. Esc 도 같은 가드가 필요하다. */
export const isImeComposingEvent = (
  event: KeyboardEvent<HTMLElement>,
  composing: boolean,
): boolean =>
  event.nativeEvent.isComposing ||
  composing ||
  event.keyCode === 229 ||
  event.key === "Process" ||
  event.key === "Unidentified";

export const useImeSafeEnter = ({
  enabled,
  onSubmit,
}: ImeSafeEnterOptions): ImeSafeEnterHandlers => {
  const composingRef = useRef(false);

  const onCompositionStart = useCallback(() => {
    composingRef.current = true;
  }, []);

  const onCompositionEnd = useCallback(() => {
    // 동기적으로 지우면 WebKit 의 확정 Enter 가 가드를 통과한다.
    requestAnimationFrame(() => {
      composingRef.current = false;
    });
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!enabled) return;
      if (isImeComposingEvent(event, composingRef.current)) return;
      if (event.key !== "Enter") return;
      // Shift+Enter 는 개행. 나머지 조합키는 OS 단축키이므로 건드리지 않는다.
      if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }
      // Enter 를 누른 채로 두면 연속 전송이 된다.
      if (event.repeat) return;

      event.preventDefault();
      onSubmit();
    },
    [enabled, onSubmit],
  );

  return {
    isComposingRef: composingRef,
    onCompositionEnd,
    onCompositionStart,
    onKeyDown,
  };
};
