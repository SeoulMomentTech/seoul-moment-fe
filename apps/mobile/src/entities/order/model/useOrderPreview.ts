import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { PostUserOrderPreviewRes } from "@shared/services/userOrder";
import { postUserOrderPreview } from "@shared/services/userOrder";

import type { CommonRes } from "@shared/services";
import { keepPreviousData } from "@tanstack/react-query";

interface UseOrderPreviewParams {
  /** 주문할 장바구니 라인. 비면 부르지 않는다. */
  cartItemIds: number[];
  /** 배송지 縣市·區. 둘 다 있을 때만 보낸다 — 서버는 둘을 같이 받아야 지역을 정한다. */
  city?: string;
  district?: string;
}

/**
 * 주문서에 그릴 라인과 금액. POST 지만 아무것도 바꾸지 않는 조회라 쿼리로 다룬다.
 *
 * 주소가 없어도 부른다 — 서버가 본섬 기준 예상값을 주므로 라인 목록을 먼저 그릴 수 있다.
 * 그 값을 확정 배송비로 쓸지는 화면이 isShippingEstimated 를 보고 정한다.
 *
 * 주소를 고치면 키가 바뀌는데, 그때 비워 두면 라인 목록까지 사라져 화면이 통째로
 * 스켈레톤으로 돌아간다 — 주소를 고르는 동안 주문할 상품이 없어졌다 나타난다.
 * 직전 결과를 들고 있다가 새 금액이 오면 갈아끼운다(isPlaceholderData 로 알린다).
 */
export const useOrderPreview = ({
  cartItemIds,
  city,
  district,
}: UseOrderPreviewParams) => {
  const languageCode = useLanguage();
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const hasRegion = Boolean(city && district);

  return useAppQuery<
    CommonRes<PostUserOrderPreviewRes>,
    Error,
    PostUserOrderPreviewRes
  >({
    queryKey: [
      "order",
      "preview",
      cartItemIds,
      hasRegion ? city : null,
      hasRegion ? district : null,
      languageCode,
    ] as const,
    queryFn: () =>
      postUserOrderPreview(
        hasRegion
          ? { cartItemIds, city, district, languageCode }
          : { cartItemIds, languageCode },
      ),
    select: (res) => res.data,
    enabled: isAuthenticated && cartItemIds.length > 0,
    placeholderData: keepPreviousData,
    // 금액은 확정값이라 오래 들고 있을 이유가 없다. 주문서를 다시 열면 다시 묻는다.
    staleTime: 0,
  });
};
