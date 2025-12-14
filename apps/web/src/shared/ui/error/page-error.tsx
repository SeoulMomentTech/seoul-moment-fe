"use client";

import { useEffect } from "react";

import { notFound } from "next/navigation";

import { useLanguage } from "@shared/lib/hooks";

import { redirect } from "@/i18n/navigation";
import { buildErrorPayload } from "@/shared/lib/utils/log/global-error";

interface ProductPageErrorProps {
  error: Error & { digest?: string };
  reset(): void;
  fallbackPath: string;
}

export default function PageError({
  error,
  fallbackPath,
}: ProductPageErrorProps) {
  const locale = useLanguage();

  useEffect(() => {
    const payload = buildErrorPayload(error);

    if (payload.status === 404) {
      notFound();
    }

    if (payload.status === 400) {
      redirect({
        href: {
          pathname: fallbackPath,
          query: undefined,
        },
        locale,
      });
      return;
    }

    // 그 외 에러는 상위 ErrorBoundary로 전파
    throw error;
  }, [locale, error, fallbackPath]);

  return null;
}
