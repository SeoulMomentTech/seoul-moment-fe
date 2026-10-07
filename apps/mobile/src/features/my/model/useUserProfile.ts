import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import type { GetUserProfileRes } from "@shared/services/user";
import { getUserProfile } from "@shared/services/user";

import type { CommonRes } from "@shared/services";

/**
 * 로그인한 사람이 누구인지. 비로그인에서는 요청하지 않는다(401 만 받는다).
 * 로그아웃하면 enabled 가 꺼져 다음 로그인 때 다시 받는다.
 */
export const useUserProfile = () => {
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const id = useUserAuthStore((s) => s.id);

  return useAppQuery({
    // 계정이 바뀌면 앞사람 이름이 잠깐 보이지 않게 토큰의 id 를 키에 넣는다.
    queryKey: ["user", "profile", id] as const,
    queryFn: getUserProfile,
    select: (res: CommonRes<GetUserProfileRes>): GetUserProfileRes => res.data,
    enabled: isAuthenticated,
  });
};
