import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import type { GetUserInfoRes } from "@shared/services/user";
import { getUserInfo } from "@shared/services/user";

import type { CommonRes } from "@shared/services";

import { userInfoKey } from "./keys";

/**
 * 계정 정보 — 이메일, 전화번호, 수신 동의 세 개.
 * 프로필(user/profile)과 다른 엔드포인트라 따로 받는다 — 둘을 한 훅으로 묶으면
 * 한쪽이 실패할 때 멀쩡한 쪽까지 잃는다.
 */
export const useUserInfo = () => {
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const id = useUserAuthStore((s) => s.id);

  return useAppQuery({
    queryKey: userInfoKey(id),
    queryFn: getUserInfo,
    select: (res: CommonRes<GetUserInfoRes>): GetUserInfoRes => res.data,
    enabled: isAuthenticated,
  });
};
