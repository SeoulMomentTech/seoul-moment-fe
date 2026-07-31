"use client";

import { useEffect, useRef, type PropsWithChildren } from "react";

import { cn } from "@shared/lib/style";
import { Sheet, SheetContent, SheetTitle } from "@shared/ui/sheet";

import { useVisualViewportInset } from "../model/useVisualViewportInset";

interface ChatbotSheetProps extends PropsWithChildren {
  isOpen: boolean;
  titleId: string;
  title: string;
  onClose(): void;
}

export function ChatbotSheet({
  children,
  isOpen,
  onClose,
  title,
  titleId,
}: ChatbotSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useVisualViewportInset(isOpen);

  /*
   * Android 하드웨어/제스처 Back 처리. Radix 는 이걸 다루지 않아서, 전체화면
   * 스크롤 락 시트가 열린 상태의 Back 이 시트를 닫는 대신 하위 페이지를
   * 이동시킨다 — 사용자는 자기 위치를 잃고 그 사실조차 모른다.
   * 이 저장소에 선례가 없으므로 여기서 만든다. 모바일 모달 분기 전용.
   */
  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ chatbot: true }, "");

    const handlePopState = () => onClose();
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      // 사용자가 Back 이 아닌 방법으로 닫았으면 심어둔 센티널을 걷어낸다.
      if (window.history.state?.chatbot) window.history.back();
    };
  }, [isOpen, onClose]);

  return (
    <Sheet onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <SheetContent
        aria-describedby={undefined}
        aria-labelledby={titleId}
        className={cn(
          // side="bottom" 기본이 h-auto 이고 SheetContent 가 gap-4 를 박아둔다.
          // 둘 다 덮어써야 헤더/스레드/컴포저가 붙는다.
          "h-[100dvh] max-h-[100dvh] gap-0 p-0",
          // 100vh 가 아니라 100dvh — iOS 에서 100vh 는 툴바가 숨겨진 large
          // 뷰포트라 하단 행이 툴바 아래로 잘린다.
          // --chat-kb 는 useVisualViewportInset 이 채운다(가상 키보드 보정).
          "!h-[calc(100dvh-var(--chat-kb,0px))]",
        )}
        // 데스크탑 패널과 같은 훅 — 모바일 프로젝트가 추가되면 같은 셀렉터로
        // 두 표면을 모두 타겟할 수 있다.
        data-testid="chat-panel"
        // 막지 않으면 Radix FocusScope 가 첫 tabbable(=textarea)을 잡아 키보드가
        // 즉시 튀어나오고, 시트가 눌리며 iOS 스크롤 점프가 발생한다.
        // 대신 컨테이너에 포커스를 두어 스크린리더가 패널 상단부터 읽게 한다.
        hideClose
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          containerRef.current?.focus({ preventScroll: true });
        }}
        ref={sheetRef}
        side="bottom"
      >
        {/*
          Header.tsx:193 / FilterSheet.tsx:87 의 `<SheetTitle className="sr-only" />`
          패턴을 베끼지 않는다 — children 이 없어서 dev 경고만 끄고 aria-labelledby
          는 빈 요소를 가리키는, 이름 없는 다이얼로그가 된다.
          여기서는 실제 번역 텍스트를 넣는다(시각적으로는 헤더가 이미 보여주므로
          sr-only).
        */}
        <SheetTitle className="sr-only">{title}</SheetTitle>
        <div
          className="flex min-h-0 flex-1 flex-col focus:outline-none"
          ref={containerRef}
          tabIndex={-1}
        >
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
