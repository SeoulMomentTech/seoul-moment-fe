import { Suspense, type PropsWithChildren } from "react";

import { ErrorBoundary } from "react-error-boundary";

import type { DashboardCardMeta } from "../constants";
import { DashboardCardFrame } from "./DashboardCardFrame";

interface DashboardCardBoundaryProps {
  meta: DashboardCardMeta;
  onReset(): void;
}

/**
 * 카드 하나를 감싸는 로딩·에러 경계.
 *
 * Suspense 를 그리드 전체에 하나만 두면 가장 느린 응답을 모두가 기다리므로 카드마다 따로 둔다.
 * ErrorBoundary 도 카드마다 필요하다 — useSuspenseQuery 는 에러를 throw 하는데, 여기서
 * 잡지 않으면 Router 의 GlobalErrorBoundary 까지 올라가 도메인 API 하나 때문에 대시보드
 * 전체가 전체 화면 에러로 덮인다.
 */
export function DashboardCardBoundary({
  meta,
  onReset,
  children,
}: PropsWithChildren<DashboardCardBoundaryProps>) {
  return (
    <ErrorBoundary
      fallbackRender={({ resetErrorBoundary }) => (
        <DashboardCardFrame
          meta={meta}
          slot={{ type: "error", onRetry: resetErrorBoundary }}
        />
      )}
      onReset={onReset}
    >
      <Suspense
        fallback={<DashboardCardFrame meta={meta} slot={{ type: "loading" }} />}
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
