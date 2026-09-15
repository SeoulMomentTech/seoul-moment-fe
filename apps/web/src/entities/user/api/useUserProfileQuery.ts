import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useUserAuthStore } from "@shared/lib/hooks/useUserAuthStore";
import { getUserProfile, type UserProfile } from "@shared/services/user";

export function useGetUserProfileQuery() {
  const { id } = useUserAuthStore();

  return useAppQuery<
    Awaited<ReturnType<typeof getUserProfile>>,
    Error,
    UserProfile
  >({
    queryKey: ["user", "profile", id],
    queryFn: getUserProfile,
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}
