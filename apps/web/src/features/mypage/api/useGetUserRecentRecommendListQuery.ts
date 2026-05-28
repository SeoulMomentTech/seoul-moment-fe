import { useLanguage } from "@shared/lib/hooks";
import {
  getUserRecentRecommendList,
  type GetUserRecentRecommendListRes,
} from "@shared/services/userRecent";

import useAppQuery from "@/shared/lib/hooks/query/useAppQuery";
import { useUserAuthStore } from "@/shared/lib/hooks/useUserAuthStore";

interface Args {
  enabled?: boolean;
}

export function useGetUserRecentRecommendListQuery({ enabled }: Args = {}) {
  const languageCode = useLanguage();
  const { id } = useUserAuthStore();

  return useAppQuery<
    Awaited<ReturnType<typeof getUserRecentRecommendList>>,
    Error,
    GetUserRecentRecommendListRes
  >({
    queryKey: ["user", "recent", "recommend", languageCode, id],
    queryFn: () => getUserRecentRecommendList({ languageCode }),
    select: (res) => res.data,
    enabled: enabled !== false && !!id,
  });
}
