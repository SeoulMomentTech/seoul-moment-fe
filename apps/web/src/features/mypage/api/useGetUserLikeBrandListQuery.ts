import { useAppInfiniteQuery, useLanguage } from "@shared/lib/hooks";
import {
  getUserBrandLikeList,
  type GetUserBrandLikeListRes,
  type UserBrandLike,
} from "@shared/services/userLike";

import type { CommonRes } from "@shared/services";

interface Args {
  count?: number;
  enabled?: boolean;
}

type PageRes = CommonRes<GetUserBrandLikeListRes>;

export function useGetUserLikeBrandListQuery({
  count = 20,
  enabled,
}: Args = {}) {
  const languageCode = useLanguage();

  return useAppInfiniteQuery<PageRes, Error, UserBrandLike[]>({
    queryKey: ["user", "like", "brand", { count, languageCode }],
    queryFn: ({ pageParam = 1 }) =>
      getUserBrandLikeList({
        page: pageParam as number,
        count,
        languageCode,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const { total } = lastPage.data;
      const fetched = allPages.reduce(
        (acc, page) => acc + page.data.list.length,
        0,
      );
      return fetched < total ? allPages.length + 1 : undefined;
    },
    select: (res) => res.pages.flatMap((page) => page.data.list),
    enabled,
  });
}
