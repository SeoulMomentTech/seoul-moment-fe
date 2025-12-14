"use client";

import PageError from "@shared/ui/error/page-error";

interface NewsDetailPageErrorProps {
  error: Error & { digest?: string };
  reset(): void;
}

export default function NewsDetailPageError(props: NewsDetailPageErrorProps) {
  return <PageError {...props} fallbackPath="/" />;
}
