import { getUserProfile, type UserProfile } from "@shared/services/user";

import useAppQuery from "@/shared/lib/hooks/query/useAppQuery";

export function useGetUserProfileQuery() {
  return useAppQuery<
    Awaited<ReturnType<typeof getUserProfile>>,
    Error,
    UserProfile
  >({
    queryKey: ["user", "profile"],
    queryFn: getUserProfile,
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });
}
