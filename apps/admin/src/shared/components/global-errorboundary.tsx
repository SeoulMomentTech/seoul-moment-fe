import type { PropsWithChildren } from "react";

import { AlertCircle } from "lucide-react";

import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

import { Button } from "@seoul-moment/ui";
import { QueryErrorResetBoundary } from "@tanstack/react-query";

function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
          {/* Icon and Title */}
          <div className="mb-6 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              앗! 문제가 발생했습니다
            </h1>
            <p className="text-gray-600">
              예상치 못한 오류가 발생하여 페이지를 표시할 수 없습니다.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              className="flex items-center justify-center gap-4"
              onClick={resetErrorBoundary}
            >
              다시 시도
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-500">
              문제가 계속되면 페이지를 새로고침하거나 관리자에게 문의해주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GlobalErrorBoundary({ children }: PropsWithChildren) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary fallbackRender={ErrorFallback} onReset={reset}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
