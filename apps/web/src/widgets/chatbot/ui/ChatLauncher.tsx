import type { Ref } from "react";

import { MessageCircle } from "lucide-react";

import { cn } from "@shared/lib/style";
import { Floating } from "@shared/ui/floating";

interface ChatLauncherProps {
  hasUnread?: boolean;
  isOpen: boolean;
  label: string;
  panelId: string;
  ref?: Ref<HTMLButtonElement>;
  unreadLabel: string;
  onPrefetch?(): void;
  onToggle(): void;
}

/**
 * 우하단 상시 런처.
 *
 * motion 을 쓰지 않는다 — 두 가지 이유가 겹친다.
 * 1) e2e/about-motion.spec.ts 의 `unsettled()` 가 `[style*="opacity"]` 로
 *    문서 전체를 훑어 computed opacity === "1" 을 단정한다. motion 은 opacity 를
 *    인라인 스타일에 쓰므로, 상시 마운트된 motion 요소는 그 단정을 깨뜨린다.
 * 2) 모든 라우트가 지불하는 요소라 motion 번들을 여기서 끌어오면 안 된다
 *    (DESIGN.md §7: MotionProvider 는 화면 단위로).
 * 필요한 연출은 CSS transition 으로 충분하다.
 *
 * `@seoul-moment/ui` 의 Button 을 쓰지 않는 이유 — 기본 type 이 없고, children 을
 * 여분의 <div> 로 감싸며, focus:ring-transparent 를 자체적으로 다시 선언한다.
 */
export function ChatLauncher({
  hasUnread = false,
  isOpen,
  label,
  onPrefetch,
  onToggle,
  panelId,
  ref,
  unreadLabel,
}: ChatLauncherProps) {
  /*
   * 우하단. 이 코너는 이미 두 개가 쓰고 있어서 둘 다 비켜 두었다:
   * - sonner 토스트(기본 position="bottom-right") → layout.tsx 에서
   *   offset/mobileOffset 을 런처 위로 올렸다.
   * - 프로모션 페이지의 ScrollToTop → 런처 위에 수직으로 쌓도록 옮겼다.
   * 좌하단으로 되돌릴 때는 그 두 곳도 함께 되돌려야 한다.
   */
  return (
    <Floating className="bottom-6 right-6 z-30 max-sm:bottom-4 max-sm:right-4">
      {/*
        aria-label 을 붙이지 않는다. 브레이크포인트마다 다른 이름을 주거나
        보이는 텍스트와 다른 aria-label 을 주면 WCAG 2.5.3(Label in Name)
        위반이다. 접근명은 아래 라벨 텍스트가 그대로 맡고(모바일에서도
        sr-only 로 남는다), 열림/닫힘은 aria-expanded 가 전달한다 —
        비모달 disclosure 의 정석 조합이다.
      */}
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className={cn(
          // relative — 모바일에서 도트가 배지로 절대 배치되는 기준점.
          "focus-ring relative flex items-center gap-2 rounded-full",
          // 콘텐츠 사이즈. w-*/min-w-* 를 주면 ko→en 확장(이 메시지 세트 실측
          // 5~6배)에서 라벨이 잘린다. max-w 는 오역 방어용 최후 수단.
          "text-body-3 h-12 max-w-[min(80vw,320px)] whitespace-nowrap px-4",
          "bg-black font-medium text-white",
          // 푸터가 모든 라우트 하단에서 bg-black 이고 about/home/news 에도
          // 검정 섹션이 있다. 검정 위 검정 필은 경계 없는 흰 글자 덩어리가
          // 되므로 링과 앰비언트 섀도로 분리한다. 흰 배경에서는 둘 다 무해하다.
          "shadow-[0_4px_16px_rgba(0,0,0,0.24)] ring-1 ring-white/15",
          "duration-normal transition-colors hover:bg-neutral-800",
          // 모바일은 라벨 자리가 없어 원형 + 아이콘.
          "max-sm:size-14 max-sm:justify-center max-sm:px-0",
        )}
        data-testid="chat-launcher"
        onClick={onToggle}
        onFocus={onPrefetch}
        onPointerEnter={onPrefetch}
        ref={ref}
        type="button"
      >
        {/* 데스크탑: 오렌지 도트가 브랜드 노트 + '지금 응답 가능' 표시.
            모바일: 라벨이 없으니 아이콘이 어포던스를 맡고 도트는 배지로 붙는다.

            헤일로는 **닫혀 있을 때만** 돈다. 패널이 열리면 "여기 있어요" 라는
            신호는 이미 역할을 다했고, 대화 중에 계속 깜빡이는 건 순수한 소음이다
            (operate 원칙: 모션은 상태를 전달할 때만). 덕분에 상시 노출 요소가
            항상 움직이는 것도 아니게 된다. */}
        <span
          aria-hidden="true"
          className={cn(
            "bg-brand duration-normal relative shrink-0 rounded-full transition-all",
            hasUnread ? "size-2.5" : "size-2",
            !isOpen && "chat-live-dot",
            "max-sm:absolute max-sm:right-3.5 max-sm:top-3.5",
          )}
        />
        <MessageCircle
          aria-hidden="true"
          className="hidden size-6 shrink-0 max-sm:block"
          strokeWidth={1.75}
        />
        {/* hidden 이 아니라 sr-only — 모바일에서도 접근명에 라벨이 남아야
            보이는 텍스트와 접근명이 어긋나지 않는다(WCAG 2.5.3). */}
        <span className="max-sm:sr-only">{label}</span>
        {hasUnread && <span className="sr-only">{unreadLabel}</span>}
      </button>
    </Floating>
  );
}
