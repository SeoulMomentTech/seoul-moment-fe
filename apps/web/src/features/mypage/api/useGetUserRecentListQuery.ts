import { useLanguage } from "@shared/lib/hooks";
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import {
  getUserRecentList,
  type GetUserRecentListRes,
} from "@shared/services/userRecent";

import { useUserAuthStore } from "@/shared/lib/hooks/useUserAuthStore";

interface Args {
  page?: number;
  count?: number;
  enabled?: boolean;
}

export function useGetUserRecentListQuery({
  page = 1,
  count = 20,
  enabled,
}: Args = {}) {
  const languageCode = useLanguage();
  const { id } = useUserAuthStore();

  return useAppQuery<
    Awaited<ReturnType<typeof getUserRecentList>>,
    Error,
    GetUserRecentListRes
  >({
    queryKey: ["user", "recent", { page, count, languageCode }, id],
    queryFn: () => getUserRecentList({ page, count, languageCode }),
    select: (res) => res.data,
    enabled: enabled !== false && !!id,
  });
}
