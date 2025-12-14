"use client";

import PageError from "@shared/ui/error/page-error";

interface ProductDetailPageErrorProps {
  error: Error & { digest?: string };
  reset(): void;
}

export default function ProductDetailPageError(
  props: ProductDetailPageErrorProps,
) {
  return <PageError {...props} fallbackPath="/product" />;
}
