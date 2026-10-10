import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import type { GetUserCartCountRes } from "@shared/services/userCart";
import { getUserCartCount } from "@shared/services/userCart";

import type { CommonRes } from "@shared/services";

import { userCartKeys } from "./keys";

/**
 * 헤더 뱃지에 적을 라인 수. 로그아웃 상태에서는 요청 자체가 나가지 않는다 —
 * 401 을 받아 토큰 재발급까지 돌릴 이유가 없고, 로그인하지 않은 사람에게는
 * 셀 장바구니가 없다.
 *
 * 숫자를 못 받은 동안(로딩·실패·로그아웃)은 undefined 가 그대로 나간다. 호출부가
 * "모른다"와 "0 이다"를 구분할 수 있어야 뱃지를 함부로 0 으로 그리지 않는다.
 */
export const useUserCartCount = () => {
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const id = useUserAuthStore((s) => s.id);

  return useAppQuery({
    queryKey: userCartKeys.count(id),
    queryFn: getUserCartCount,
    select: (res: CommonRes<GetUserCartCountRes>): number => res.data.count,
    enabled: isAuthenticated,
  });
};
