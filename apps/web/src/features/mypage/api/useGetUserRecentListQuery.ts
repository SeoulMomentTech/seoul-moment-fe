import { useLanguage } from "@shared/lib/hooks";
import {
  getUserRecentList,
  type GetUserRecentListRes,
} from "@shared/services/userRecent";

import useAppQuery from "@/shared/lib/hooks/query/useAppQuery";

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

  return useAppQuery<
    Awaited<ReturnType<typeof getUserRecentList>>,
    Error,
    GetUserRecentListRes
  >({
    queryKey: ["user", "recent", { page, count, languageCode }],
    queryFn: () => getUserRecentList({ page, count, languageCode }),
    select: (res) => res.data,
    enabled,
  });
}
