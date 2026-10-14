import type { MetadataRoute } from "next";

import { getArticleList } from "@shared/services/article";
import { getBrandFilter } from "@shared/services/brand";
import { getNewsList } from "@shared/services/news";
import { getProductList } from "@shared/services/product";

import { routing } from "@/i18n/routing";

const MAX_LIST_COUNT = 10000;
const PRODUCT_PAGE_SIZE = 200;
const DEV_SITEMAP_TTL_MS = 1000 * 60 * 60 * 6;

// lastModified 는 실제 수정 시각을 아는 항목에만 싣는다. 요청 시각을 넣으면
// 매번 "방금 수정됨"이 되어 검색엔진이 사이트 전체의 lastmod 를 신뢰하지 않게 된다.
// changeFrequency / priority 는 Google 이 무시하므로 내보내지 않는다.
interface SitemapEntry {
  id: number;
  lastModified?: Date;
}

interface DynamicRouteConfig {
  basePath: string;
  entries: SitemapEntry[];
}

export const revalidate = 3600;

let devSitemapCache: {
  expiresAt: number;
  data: MetadataRoute.Sitemap;
} | null = null;

const localeUrl = (baseUrl: string, locale: string, path: string) =>
  `${baseUrl}/${locale}${path}`;

const buildLanguages = (baseUrl: string, path: string) => ({
  ...Object.fromEntries(
    routing.locales.map((locale) => [locale, localeUrl(baseUrl, locale, path)]),
  ),
  "x-default": localeUrl(baseUrl, routing.defaultLocale, path),
});

// 로케일마다 <url> 을 하나씩 두고, 각 항목에 같은 hreflang 묶음을 단다.
// (기본 로케일 URL 하나에만 alternates 를 다는 방식은 Google 권장 형태가 아니다)
const buildLocalizedRoutes = (
  baseUrl: string,
  path: string,
  lastModified?: Date,
): MetadataRoute.Sitemap => {
  const languages = buildLanguages(baseUrl, path);

  return routing.locales.map((locale) => ({
    url: localeUrl(baseUrl, locale, path),
    ...(lastModified && { lastModified }),
    alternates: { languages },
  }));
};

const buildLocalizedDynamicRoutes = (
  baseUrl: string,
  routes: DynamicRouteConfig[],
): MetadataRoute.Sitemap =>
  routes.flatMap((route) =>
    route.entries.flatMap(({ id, lastModified }) =>
      buildLocalizedRoutes(baseUrl, `${route.basePath}/${id}`, lastModified),
    ),
  );

const toEntries = (ids: number[]): SitemapEntry[] => ids.map((id) => ({ id }));

const parseDate = (value: string) => {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
};

// 같은 id 가 중복으로 내려오면 첫 항목만 남긴다.
const uniqueById = (entries: SitemapEntry[]) => {
  const seen = new Set<number>();

  return entries.filter(({ id }) => !seen.has(id) && seen.add(id));
};

const getProductIds = async () => {
  const languageCode = routing.defaultLocale;
  const ids: number[] = [];
  let page = 1;
  let total = Infinity;

  while (ids.length < total && ids.length < MAX_LIST_COUNT) {
    const response = await getProductList({
      languageCode,
      page,
      count: PRODUCT_PAGE_SIZE,
    });

    const list = response.data.list ?? [];
    total = response.data.total ?? 0;

    if (list.length === 0) break; // 진행 없음 → 무한 루프 방지

    ids.push(...list.map((product) => product.id));
    page += 1;
  }

  return [...new Set(ids)];
};

const getBrandIds = async () => {
  const response = await getBrandFilter();

  return [
    ...new Set(
      response.data.list.flatMap((group) =>
        group.brandNameList.map((brand) => brand.id),
      ),
    ),
  ];
};

// news / article 은 수정 시각 필드가 없어 작성 시각(createDate)을 lastmod 로 쓴다.
const getNewsEntries = async () => {
  const response = await getNewsList({
    languageCode: routing.defaultLocale,
    count: MAX_LIST_COUNT,
  });

  return uniqueById(
    response.data.list.map((news) => ({
      id: news.id,
      lastModified: parseDate(news.createDate),
    })),
  );
};

const getArticleEntries = async () => {
  const response = await getArticleList({
    languageCode: routing.defaultLocale,
    count: MAX_LIST_COUNT,
  });

  return uniqueById(
    response.data.list.map((article) => ({
      id: article.id,
      lastModified: parseDate(article.createDate),
    })),
  );
};

const safeEntries = async (fetcher: () => Promise<SitemapEntry[]>) => {
  try {
    return await fetcher();
  } catch {
    return [];
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.NODE_ENV !== "production") {
    const now = Date.now();

    if (devSitemapCache && now < devSitemapCache.expiresAt) {
      return devSitemapCache.data;
    }
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_WEB_URL?.replace(/\/$/, "") ??
    "https://seoulmoment.com.tw";
  const staticPaths = [
    "",
    "/about",
    //"/brand",
    "/product",
    //"/magazine",
    "/news",
    "/contact",
    "/policy",
    "/terms",
  ];

  const [productEntries, brandEntries, newsEntries, articleEntries] =
    await Promise.all([
      safeEntries(async () => toEntries(await getProductIds())),
      safeEntries(async () => toEntries(await getBrandIds())),
      safeEntries(getNewsEntries),
      safeEntries(getArticleEntries),
    ]);

  const dynamicRoutes: DynamicRouteConfig[] = [
    { basePath: "/product", entries: productEntries },
    { basePath: "/brand", entries: brandEntries },
    { basePath: "/news", entries: newsEntries },
    { basePath: "/article", entries: articleEntries },
  ];

  const result = [
    ...staticPaths.flatMap((path) => buildLocalizedRoutes(baseUrl, path)),
    ...buildLocalizedDynamicRoutes(baseUrl, dynamicRoutes),
  ];

  if (process.env.NODE_ENV !== "production") {
    devSitemapCache = {
      data: result,
      expiresAt: Date.now() + DEV_SITEMAP_TTL_MS,
    };
  }

  return result;
}
