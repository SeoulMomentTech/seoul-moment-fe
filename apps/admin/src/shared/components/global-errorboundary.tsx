import type { PropsWithChildren } from "react";

import { AlertCircle, FileQuestion, Lock, ServerCrash } from "lucide-react";

import { PATH } from "@shared/constants/route";
import axios from "axios";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

import { Button, HStack, VStack } from "@seoul-moment/ui";
import { QueryErrorResetBoundary } from "@tanstack/react-query";


import { DevErrorDetails } from "./dev-error-details";

interface ErrorConfig {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  buttonText?: string;
  action?(): void;
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const status = axios.isAxiosError(error) ? error.response?.status : null;

  const errorConfigs: Record<number, ErrorConfig> = {
    401: {
      icon: <Lock className="h-8 w-8 text-orange-600" />,
      iconBg: "bg-orange-100",
      title: "인증이 만료되었습니다",
      description: "다시 로그인하여 서비스를 이용해 주세요.",
      buttonText: "로그인으로 이동",
      action: () => {
        window.location.href = PATH.LOGIN;
      },
    },
    403: {
      icon: <Lock className="h-8 w-8 text-red-600" />,
      iconBg: "bg-red-100",
      title: "접근 권한이 없습니다",
      description: "이 페이지를 볼 수 있는 권한이 없는 것 같습니다.",
    },
    404: {
      icon: <FileQuestion className="h-8 w-8 text-blue-600" />,
      iconBg: "bg-blue-100",
      title: "데이터를 찾을 수 없습니다",
      description: "요청하신 정보를 찾을 수 없거나 삭제되었을 수 있습니다.",
      buttonText: "홈으로 이동",
      action: () => {
        window.location.href = PATH.INDEX;
      },
    },
    500: {
      icon: <ServerCrash className="h-8 w-8 text-red-600" />,
      iconBg: "bg-red-100",
      title: "서버 오류가 발생했습니다",
      description: "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    },
  };

  const config: ErrorConfig = (status && errorConfigs[status]) || {
    icon: <AlertCircle className="h-8 w-8 text-red-600" />,
    iconBg: "bg-red-100",
    title: "앗! 문제가 발생했습니다",
    description: "예상치 못한 오류가 발생하여 페이지를 표시할 수 없습니다.",
  };

  const handleAction = () => {
    if (config.action) {
      config.action();
      resetErrorBoundary();
      return;
    }
    resetErrorBoundary();
  };

  return (
    <HStack align="center" className="min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-2xl">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
          <HStack align="center" className="mb-6">
            <HStack
              align="center"
              className={`h-16 w-16 rounded-full ${config.iconBg}`}
            >
              {config.icon}
            </HStack>
          </HStack>

          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              {config.title}
            </h1>
            <p className="text-gray-600">{config.description}</p>
          </div>

          <VStack align="center" className="gap-3">
            <Button className="min-w-[140px]" onClick={handleAction}>
              {config.buttonText || "다시 시도"}
            </Button>
          </VStack>

          {/* Developer Debug Information (Separated Component) */}
          <DevErrorDetails error={error} />

          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-500">
              문제가 계속되면 페이지를 새로고침하거나 관리자에게 문의해주세요.
              {status && (
                <span className="ml-2 opacity-50">(Status Code: {status})</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </HStack>
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
