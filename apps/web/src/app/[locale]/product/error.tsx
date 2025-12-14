"use client";

import { useEffect } from "react";

import { useLanguage } from "@shared/lib/hooks";

import { redirect } from "@/i18n/navigation";
import { buildErrorPayload } from "@/shared/lib/utils/log/global-error";

interface ProductPageErrorProps {
  error: Error & { digest?: string };
}

export default function ProductPageError({ error }: ProductPageErrorProps) {
  const locale = useLanguage();

  useEffect(() => {
    const payload = buildErrorPayload(error);

    if (payload.status === 404) {
      redirect({
        href: {
          pathname: "/product",
          query: undefined,
        },
        locale,
      });
      return;
    }

    // 그 외 에러는 상위 ErrorBoundary로 전파
    throw error;
  }, [locale, error]);

  return null;
}
