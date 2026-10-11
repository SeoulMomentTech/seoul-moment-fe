import { ProductCarousel } from "@entities/product/ui/ProductCarousel";
import { useTranslations } from "@shared/lib/i18n/useTranslations";
import { Section } from "@shared/ui/section";
import { SectionError } from "@shared/ui/section-state";
import { ProductRowSkeleton } from "@shared/ui/skeleton";

import { useBrandProducts } from "../model/useBrandProducts";

/** 브랜드 소개 맨 아래 상품 줄. 섹션이 실패해도 소개 본문은 그대로 남는다. */
export function BrandProducts({ brandId }: { brandId: number }) {
  const t = useTranslations();
  const { data, isPending, isError, fetchStatus, refetch } =
    useBrandProducts(brandId);

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (isPending && fetchStatus === "paused") {
    return (
      <Section title={t("brand_products")}>
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  if (isPending) {
    return (
      <Section title={t("brand_products")}>
        <ProductRowSkeleton />
      </Section>
    );
  }

  if (isError) {
    return (
      <Section title={t("brand_products")}>
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  // 브랜드에 상품이 없을 수 있다(dev 에도 그런 조합이 있다). 제목만 남기지 않고 줄째로 뺀다.
  if (!data || data.length === 0) {
    return null;
  }

  return <ProductCarousel heading={t("brand_products")} items={data} />;
}
