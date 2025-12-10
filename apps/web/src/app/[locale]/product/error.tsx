"use client";

import { useEffect } from "react";

import { useLanguage } from "@shared/lib/hooks";

import { redirect } from "@/i18n/navigation";

export default function ProductPageError() {
  const locale = useLanguage();

  useEffect(() => {
    // Attempt to infer locale from URL or other source if needed
    // For now, simply use 'en' as a fallback, but ideally, locale should come from the router or props
    redirect({
      href: {
        pathname: "/product",
        query: undefined,
      },
      locale,
    });
  }, [locale]);

  return null;
}
