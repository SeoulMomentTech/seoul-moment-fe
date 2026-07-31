"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";

import { motion } from "motion/react";

import { cn } from "@shared/lib/style";

import { isImeComposingEvent } from "@features/chatbot";

interface ChatbotPanelProps extends React.PropsWithChildren {
  isOpen: boolean;
  launcherRef: RefObject<HTMLButtonElement | null>;
  panelId: string;
  titleId: string;
  onClose(): void;
}

/** 하우스 easing(expo-out). shared-styles.css 의 animate 토큰과 같은 값. */
const EASE = [0.16, 1, 0.3, 1] as const;

export function ChatbotPanel({
  children,
  isOpen,
  launcherRef,
  onClose,
  panelId,
  titleId,
}: ChatbotPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  /*
   * Esc 리스너를 패널 요소에 스코프한다. document 에 걸면 세 가지가 깨진다:
   * 1) 비모달이라 사용자가 페이지의 다른 부분을 다루는 중일 수 있는데,
   *    전역 Esc 는 그때 대화를 닫아버린다.
   * 2) 위에 Radix 다이얼로그가 열려 있으면 DismissableLayer 가 처리한 뒤에도
   *    이벤트가 document 까지 전파돼 Esc 한 번에 둘 다 닫힌다.
   * 3) 눈에 보이는 무엇과도 대응되지 않는 동작이 된다.
   *
   * 결과적으로 사용자가 패널 밖으로 Tab 해 나가면 Esc 가 더는 닫지 않는다 —
   * 비모달 표면에서는 그게 맞고, 그 상태의 어포던스는 보이는 닫기 버튼이다.
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Escape") return;
      // 브라우저는 Esc 로 IME 조합을 취소한다. 가드가 없으면 반쯤 쓴 한글을
      // 버리려 Esc 를 누른 사용자의 대화창이 닫힌다.
      if (isImeComposingEvent(event, false)) return;

      event.stopPropagation();
      onClose();
    },
    [onClose],
  );

  // 닫을 때 포커스 복귀는 조건부. 무조건 되돌리면 이미 페이지로 옮겨간
  // 사용자의 포커스를 탈취한다.
  const wasOpenRef = useRef(isOpen);

  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = isOpen;

    if (isOpen || !wasOpen) return;
    if (!panelRef.current?.contains(document.activeElement)) return;

    launcherRef.current?.focus({ preventScroll: true });
  }, [isOpen, launcherRef]);

  return (
    <motion.div
      animate={
        isOpen
          ? { opacity: 1, scale: 1, y: 0 }
          : { opacity: 0, scale: 0.94, y: 12 }
      }
      aria-hidden={!isOpen}
      aria-labelledby={titleId}
      className={cn(
        "fixed bottom-[88px] right-6 z-40 flex flex-col overflow-hidden",
        // 폭·높이 모두 클램프. 380×620 을 그대로 쓰면 24+48+16+620 = 708px 가
        // 필요한데, 1280×720 노트북은 헤더(56px) 아래 664px 뿐이라 패널이
        // 헤더를 침범한다. z-40 > z-11 이라 내비를 덮는데 외부 클릭으로
        // 닫히지도 않아 사용자가 갇힌다.
        //
        // 180px 의 근거: 헤더 56 + bottom 오프셋 88 + 여유 36.
        // 여유가 필요한 이유 — `bottom` 은 fixed 컨테이닝 블록(가로 스크롤바를
        // **제외한** 높이) 기준인데 `100dvh` 는 스크롤바를 **포함한** 전체
        // 뷰포트다. 이 앱은 헤더가 min-w-[1280px] 여서 좁은 데스크탑에서 실제로
        // 가로 스크롤바가 생기고, 그 15~17px 만큼 두 기준이 어긋난다.
        // (측정: 1280×720 에서 152px 를 쓰면 헤더를 7px 침범했다.)
        "h-[min(620px,calc(100dvh-180px))] w-[min(380px,calc(100vw-2rem))]",
        "bg-background rounded-xl border border-black/10",
        // 하우스 앰비언트 링(0 0 4px rgba(0,0,0,.16))보다 한 단계 넓게 — 페이지
        // 위에 떠 있는 표면이므로 접지 그림자가 필요하다.
        "shadow-[0_8px_28px_rgba(0,0,0,0.18)]",
        // 마운트 래치 때문에 닫혀도 DOM 에 남는다. inert 없이 두면 모든
        // 페이지에 죽은 탭 스톱과 a11y 트리 오염이 생긴다.
        !isOpen && "pointer-events-none",
      )}
      data-testid="chat-panel"
      id={panelId}
      inert={!isOpen}
      onKeyDown={handleKeyDown}
      ref={panelRef}
      /*
       * role="region" 을 쓴다. role="dialog" + aria-modal="false" 도 형식상
       * 유효하지만, 포커스 트랩이 없고 Tab 이 빠져나가는 표면에 dialog 를 주면
       * AT 가 모달 자세로 읽고 일부 스크린리더가 가상 커서를 제한한다.
       * region + 라벨이 정직하고 위험이 낮다.
       */
      role="region"
      // 런처가 있는 코너에서 자라나야 한다 — 런처가 우하단이므로 bottom right.
      style={{ transformOrigin: "bottom right" }}
      transition={{ duration: isOpen ? 0.28 : 0.18, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
