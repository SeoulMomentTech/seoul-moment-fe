import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getQueryClient, HydrateClient } from "@shared/lib/query";
import { getBrandFilter } from "@shared/services/brand";
import { getCategories } from "@shared/services/category";
import { getProductBanner, getProductList } from "@shared/services/product";

import type { LanguageType } from "@/i18n/const";
import { buildLocalizedAlternates } from "@/i18n/metadata";
import type { PageParams } from "@/types";

import { ProductPage } from "@views/product";

const PRODUCT_LIST_LIMIT = 10;

// useProductFilter가 URL로 관리하는 필터 키. 하나라도 있으면 클라이언트 쿼리 키가
// 기본값과 달라지므로, 기본(무필터) 진입에서만 서버 prefetch를 수행한다.
const PRODUCT_FILTER_KEYS = [
  "search",
  "brandId",
  "sort",
  "categoryId",
  "productCategoryId",
  "sortColumn",
  "optionIdList",
] as const;

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { locale } = await params;

  try {
    const t = await getTranslations();

    return {
      title: t("seo_shop_title"),
      description: t("seo_shop_description"),
      alternates: buildLocalizedAlternates(locale, "/product"),
    };
  } catch {
    return {
      alternates: buildLocalizedAlternates(locale, "/product"),
    };
  }
}

export default async function Product({
  params,
  searchParams,
}: PageParams & {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  const isFiltered = PRODUCT_FILTER_KEYS.some(
    (key) => resolvedSearchParams[key] != null,
  );

  // 무필터 진입일 때만 above-the-fold 블로킹 쿼리들을 서버에서 채운다.
  // (Banner/Categories/BrandFilter는 로컬 Suspense가 없어 페이지 전체를 막고,
  //  상품 그리드는 useAppInfiniteQuery 첫 페이지만 prefetch한다.)
  // 필터가 있으면 클라이언트 쿼리 키가 달라지므로 prefetch를 건너뛰고
  // loading.tsx 스켈레톤 + 기존 클라이언트 페칭에 맡긴다.
  if (!isFiltered) {
    const queryClient = getQueryClient();

    // 클라이언트 useInfiniteProducts와 동일한 params 객체(무필터 기본값).
    const productListParams = {
      search: undefined,
      brandId: undefined,
      sort: undefined,
      categoryId: undefined,
      productCategoryId: undefined,
      sortColumn: undefined,
      optionIdList: [],
      languageCode: locale as LanguageType,
    };

    await Promise.all([
      queryClient.prefetchInfiniteQuery({
        queryKey: ["products", "infinite", productListParams],
        queryFn: () =>
          getProductList({
            ...productListParams,
            page: 1,
            count: PRODUCT_LIST_LIMIT,
          }),
        initialPageParam: 1,
      }),
      queryClient.prefetchQuery({
        queryKey: ["product", "banner"],
        queryFn: getProductBanner,
      }),
      queryClient.prefetchQuery({
        queryKey: ["categories", locale],
        queryFn: () => getCategories({ languageCode: locale }),
      }),
      queryClient.prefetchQuery({
        queryKey: ["brand-filter", locale, undefined],
        queryFn: () => getBrandFilter(),
      }),
    ]);

    return (
      <HydrateClient>
        <ProductPage />
      </HydrateClient>
    );
  }

  return <ProductPage />;
}
