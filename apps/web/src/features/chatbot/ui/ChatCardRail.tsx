import type { PropsWithChildren } from "react";

import { cn } from "@shared/lib/style";

interface ChatCardRailProps {
  /** 스크린리더용 짧은 요약. 레일 자체는 낭독에서 제외한다. */
  summary: string;
}

/**
 * 메시지 안 카드 가로 레일.
 *
 * aria-live="off" 인 이유 — role="log" 자손이라 그냥 두면 카드 3장의 모든
 * 텍스트가 답변 낭독에 통째로 섞여 들어가 들을 수 없는 낭독이 된다.
 * 대신 sr-only 요약 한 줄만 남긴다.
 *
 * -mx-4 px-4 는 카드가 패널 좌우 끝까지 스크롤되게 하는 블리드.
 * 하나뿐이면 스크롤 어포던스가 필요 없으므로 레일을 접는다(호출부에서 판단).
 */
export function ChatCardRail({
  children,
  summary,
}: PropsWithChildren<ChatCardRailProps>) {
  return (
    <div aria-live="off">
      <span className="sr-only">{summary}</span>
      <ul
        className={cn(
          "scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 py-0.5",
          // 레일에서만 가로 스크롤을 소화하고 페이지로 체이닝하지 않는다.
          "overscroll-x-contain",
        )}
      >
        {children}
      </ul>
    </div>
  );
}
