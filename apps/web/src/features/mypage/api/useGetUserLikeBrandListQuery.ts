import { useLanguage } from "@shared/lib/hooks";
import {
  getUserBrandLikeList,
  type GetUserBrandLikeListRes,
} from "@shared/services/userLike";

import useAppQuery from "@/shared/lib/hooks/query/useAppQuery";

interface Args {
  page?: number;
  count?: number;
  enabled?: boolean;
}

export function useGetUserLikeBrandListQuery({
  page = 1,
  count = 20,
  enabled,
}: Args = {}) {
  const languageCode = useLanguage();

  return useAppQuery<
    Awaited<ReturnType<typeof getUserBrandLikeList>>,
    Error,
    GetUserBrandLikeListRes
  >({
    queryKey: ["user", "like", "brand", { page, count, languageCode }],
    queryFn: () => getUserBrandLikeList({ page, count, languageCode }),
    select: (res) => res.data,
    enabled,
  });
}
