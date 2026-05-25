import { useLanguage } from "@shared/lib/hooks";
import {
  getUserRecentRecommendList,
  type GetUserRecentRecommendListRes,
} from "@shared/services/userRecent";

import useAppQuery from "@/shared/lib/hooks/query/useAppQuery";

interface Args {
  enabled?: boolean;
}

export function useGetUserRecentRecommendListQuery({ enabled }: Args = {}) {
  const languageCode = useLanguage();

  return useAppQuery<
    Awaited<ReturnType<typeof getUserRecentRecommendList>>,
    Error,
    GetUserRecentRecommendListRes
  >({
    queryKey: ["user", "recent", "recommend", languageCode],
    queryFn: () => getUserRecentRecommendList({ languageCode }),
    select: (res) => res.data,
    enabled,
  });
}
