import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type {
  GetNewsByCategoryRes,
  NewsWithCategory,
} from "@shared/services/news";
import { getNewsByCategory } from "@shared/services/news";

import type { CommonRes } from "@shared/services";
import type { InfiniteData } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 10;

export const useInfiniteNewsByCategory = () => {
  const languageCode = useLanguage();

  return useInfiniteQuery({
    queryKey: ["news", "category", languageCode] as const,
    queryFn: ({ pageParam }) =>
      getNewsByCategory({ languageCode, page: pageParam, count: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (
      lastPage: CommonRes<GetNewsByCategoryRes>,
      allPages: CommonRes<GetNewsByCategoryRes>[],
    ): number | undefined =>
      allPages.length * PAGE_SIZE < lastPage.data.total
        ? allPages.length + 1
        : undefined,
    select: (
      data: InfiniteData<CommonRes<GetNewsByCategoryRes>, number>,
    ): NewsWithCategory[] => data.pages.flatMap((page) => page.data.list ?? []),
  });
};
