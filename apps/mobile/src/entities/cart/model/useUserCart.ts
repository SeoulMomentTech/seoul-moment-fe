import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { GetUserCartRes } from "@shared/services/userCart";
import { getUserCart } from "@shared/services/userCart";

import type { CommonRes } from "@shared/services";

import { userCartKeys } from "./keys";

/**
 * 장바구니 조회. 로그인한 사람에게만 요청이 나간다 — 게스트 장바구니는 앱에 없다.
 *
 * 금액은 전부 이 응답에 들어 있다(라인 금액·브랜드 합·배송비·무료배송까지 남은 금액·
 * 예상 결제 금액). 화면은 그 숫자를 그대로 쓰고 다시 더하지 않는다.
 */
export const useUserCart = () => {
  const languageCode = useLanguage();
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const id = useUserAuthStore((s) => s.id);

  return useAppQuery({
    queryKey: userCartKeys.list(id, languageCode),
    queryFn: () => getUserCart({ languageCode }),
    select: (res: CommonRes<GetUserCartRes>): GetUserCartRes => res.data,
    enabled: isAuthenticated,
  });
};
