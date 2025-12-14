"use client";

import PageError from "@shared/ui/error/page-error";

interface BrandDetailPageErrorProps {
  error: Error & { digest?: string };
  reset(): void;
}

export default function BrandDetailPageError(props: BrandDetailPageErrorProps) {
  return <PageError {...props} fallbackPath="/" />;
}
