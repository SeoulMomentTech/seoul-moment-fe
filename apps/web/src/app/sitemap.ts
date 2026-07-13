import type { MetadataRoute } from "next";

import { getArticleList } from "@shared/services/article";
import { getBrandFilter } from "@shared/services/brand";
import { getNewsList } from "@shared/services/news";
import { getProductList } from "@shared/services/product";

import { routing } from "@/i18n/routing";

const MAX_LIST_COUNT = 10000;
const PRODUCT_PAGE_SIZE = 200;
const DEV_SITEMAP_TTL_MS = 1000 * 60 * 60 * 6;

type ChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]["changeFrequency"]
>;

interface RouteConfig {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}

interface DynamicRouteConfig {
  basePath: string;
  ids: number[];
  changeFrequency: ChangeFrequency;
  priority: number;
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

const buildLocalizedRoutes = (
  baseUrl: string,
  routes: RouteConfig[],
  lastModified: Date,
): MetadataRoute.Sitemap =>
  routes.map((route) => ({
    url: localeUrl(baseUrl, routing.defaultLocale, route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: { languages: buildLanguages(baseUrl, route.path) },
  }));

const buildLocalizedDynamicRoutes = (
  baseUrl: string,
  routes: DynamicRouteConfig[],
  lastModified: Date,
): MetadataRoute.Sitemap =>
  routes.flatMap((route) =>
    route.ids.map((id) => {
      const path = `${route.basePath}/${id}`;

      return {
        url: localeUrl(baseUrl, routing.defaultLocale, path),
        lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: { languages: buildLanguages(baseUrl, path) },
      };
    }),
  );

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

const getNewsIds = async () => {
  const response = await getNewsList({
    languageCode: routing.defaultLocale,
    count: MAX_LIST_COUNT,
  });

  return [...new Set(response.data.list.map((news) => news.id))];
};

const getArticleIds = async () => {
  const response = await getArticleList({
    languageCode: routing.defaultLocale,
    count: MAX_LIST_COUNT,
  });

  return [...new Set(response.data.list.map((article) => article.id))];
};

const safeIds = async (fetcher: () => Promise<number[]>) => {
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
  const lastModified = new Date();

  const staticRoutes: RouteConfig[] = [
    { path: "", changeFrequency: "daily", priority: 1 },
    { path: "/about", changeFrequency: "monthly", priority: 0.8 },
    //{ path: "/brand", changeFrequency: "weekly", priority: 0.8 },
    { path: "/product", changeFrequency: "daily", priority: 0.9 },
    //{ path: "/magazine", changeFrequency: "weekly", priority: 0.8 },
    { path: "/news", changeFrequency: "daily", priority: 0.8 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
    { path: "/policy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  ] as const;

  const [productIds, brandIds, newsIds, articleIds] = await Promise.all([
    safeIds(getProductIds),
    safeIds(getBrandIds),
    safeIds(getNewsIds),
    safeIds(getArticleIds),
  ]);

  const dynamicRoutes: DynamicRouteConfig[] = [
    {
      basePath: "/product",
      ids: productIds,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      basePath: "/brand",
      ids: brandIds,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      basePath: "/news",
      ids: newsIds,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      basePath: "/article",
      ids: articleIds,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const result = [
    ...buildLocalizedRoutes(baseUrl, staticRoutes, lastModified),
    ...buildLocalizedDynamicRoutes(baseUrl, dynamicRoutes, lastModified),
  ];

  if (process.env.NODE_ENV !== "production") {
    devSitemapCache = {
      data: result,
      expiresAt: Date.now() + DEV_SITEMAP_TTL_MS,
    };
  }

  return result;
}
