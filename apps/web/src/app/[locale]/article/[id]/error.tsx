"use client";

import PageError from "@shared/ui/error/page-error";

interface ArticleDetailPageErrorProps {
  error: Error & { digest?: string };
  reset(): void;
}

export default function ArticleDetailPageError(
  props: ArticleDetailPageErrorProps,
) {
  return <PageError {...props} fallbackPath="/" />;
}
