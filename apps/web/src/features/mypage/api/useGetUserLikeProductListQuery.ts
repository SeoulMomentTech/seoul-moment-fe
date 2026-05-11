import { useLanguage } from "@shared/lib/hooks";
import {
  getUserProductLikeList,
  type GetUserProductLikeListRes,
} from "@shared/services/userLike";

import useAppQuery from "@/shared/lib/hooks/query/useAppQuery";

interface Args {
  page?: number;
  count?: number;
  productCategoryId?: number;
  enabled?: boolean;
}

export function useGetUserLikeProductListQuery({
  page = 1,
  count = 30,
  productCategoryId,
  enabled,
}: Args = {}) {
  const languageCode = useLanguage();

  return useAppQuery<
    Awaited<ReturnType<typeof getUserProductLikeList>>,
    Error,
    GetUserProductLikeListRes
  >({
    queryKey: [
      "user",
      "like",
      "product",
      { page, count, productCategoryId, languageCode },
    ],
    queryFn: () =>
      getUserProductLikeList({
        page,
        count,
        productCategoryId,
        languageCode,
      }),
    select: (res) => res.data,
    enabled,
  });
}
