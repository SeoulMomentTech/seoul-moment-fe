import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";

import { MotionProvider } from "@shared/ui/motion-provider";

import {
  Partners,
  Company,
  MainBanner,
  Mission,
  Vision,
} from "@features/about";
import { cn, Skeleton } from "@seoul-moment/ui";

export function AboutPage() {
  return (
    <MotionProvider>
      <MainBanner />
      <Company />
      <Vision />
      <Mission />
      {/*
       * Partners는 useSuspenseQuery를 쓰므로 경계가 없으면 파트너 카테고리 응답까지
       * 페이지 전체 스트리밍이 막힌다 — 히어로 연출 시작이 네트워크에 묶인다.
       * features/home/ui/PrimeSection 패턴을 따른다.
       */}
      <ErrorBoundary fallback={null}>
        <Suspense
          fallback={
            <Skeleton
              className={cn(
                "min-w-7xl mx-auto h-[754px] max-w-7xl",
                "max-sm:h-[600px] max-sm:min-w-full",
              )}
            />
          }
        >
          <Partners />
        </Suspense>
      </ErrorBoundary>
    </MotionProvider>
  );
}
