"use client";

import { useCallback, useEffect, useState } from "react";

import useMediaQuery from "@shared/lib/hooks/useMediaQuery";

/**
 * 패널 표면을 데스크탑 카드 / 모바일 시트로 가르는 경계.
 *
 * DESIGN.md §6 의 하우스 경계는 sm(640px) 인데 여기서만 1024px 를 쓴다. 근거:
 * widgets/header/ui/Header.tsx 의 헤더가 `min-w-[1280px]` 이고 12개가량의
 * 섹션이 `min-w-7xl` 을 들고 있어, 640~1279px 구간에서는 **본문이 이미 가로로
 * 스크롤된다**. 그 위에 고정 380px 비모달 카드를 띄우면 사용자가 읽으려는
 * 콘텐츠를 영구히 덮는데, 외부 클릭으로 닫히지도 않는다. 그래서 그 구간은
 * 전체화면 모달 시트가 맞다.
 *
 * 이 주석을 지우지 말 것 — 없으면 다음 사람이 sm 으로 "고친다".
 */
const DESKTOP_PANEL_QUERY = "(min-width: 1024px)";

interface ChatbotSurfaceState {
  isDesktop: boolean;
  /** 첫 오픈 이후로 계속 true. 아래 주석 참고. */
  shouldMountSurface: boolean;
  prefetch(): void;
}

export const useChatbotSurface = (isOpen: boolean): ChatbotSurfaceState => {
  const isDesktop = useMediaQuery(DESKTOP_PANEL_QUERY);

  /*
   * 마운트 래치. AnimatePresence 를 쓰지 않는 이유 —
   * 이 저장소 최초 사용이 되는데, lazy 경계 + `{isOpen && ...}` 게이트와 겹치면
   * exit 애니메이션이 끝나기 전에 언마운트되어 onExitComplete 핸드셰이크를
   * lazy 경계 너머로 넘겨야 한다. 대신 표면을 계속 마운트해 두고 motion 의
   * animate prop 하나로 양방향을 처리한다.
   *
   * 부수 이득: 스크롤 위치, 컴포저 초안, 진행 중인 요청이 닫기/열기를 넘어
   * 살아남는다.
   * 비용: 닫힌 패널이 DOM 에 남으므로 반드시 inert + aria-hidden +
   * pointer-events-none 를 걸어야 한다. 안 하면 모든 페이지에 죽은 탭 스톱이
   * 생긴다(ChatbotPanel 이 처리).
   */
  const [shouldMountSurface, setShouldMountSurface] = useState(false);

  useEffect(() => {
    if (isOpen) setShouldMountSurface(true);
  }, [isOpen]);

  // 런처 hover/focus 에서 청크를 미리 당겨 오픈이 즉각적으로 느껴지게 한다.
  const prefetch = useCallback(() => {
    void import("../ui/ChatbotSurface");
  }, []);

  return { isDesktop, prefetch, shouldMountSurface };
};
