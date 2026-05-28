import { getUserInfo, type UserInfo } from "@shared/services/user";

import useAppQuery from "@/shared/lib/hooks/query/useAppQuery";
import { useUserAuthStore } from "@/shared/lib/hooks/useUserAuthStore";

export function useGetUserInfoQuery() {
  const { id } = useUserAuthStore();

  return useAppQuery<Awaited<ReturnType<typeof getUserInfo>>, Error, UserInfo>({
    queryKey: ["user", "info", id],
    queryFn: getUserInfo,
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}
