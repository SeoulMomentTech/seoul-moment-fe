import { getUserInfo, type UserInfo } from "@shared/services/user";

import useAppQuery from "@/shared/lib/hooks/query/useAppQuery";

export function useGetUserInfoQuery() {
  return useAppQuery<Awaited<ReturnType<typeof getUserInfo>>, Error, UserInfo>({
    queryKey: ["user", "info"],
    queryFn: getUserInfo,
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });
}
