"use client";

import { useLanguage } from "@shared/lib/hooks";
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import {
  postUserOrderPreview,
  type PostUserOrderPreviewRes,
} from "@shared/services/userOrder";

interface UseOrderPreviewQueryParams {
  cartItemIds: ReadonlyArray<number>;
  /** 배송지 縣市. 없으면 배송비를 정할 수 없어 호출하지 않는다 */
  city?: string;
  /** 배송지 區/鄉 */
  district?: string;
}

/**
 * 주문서 금액. POST 이지만 DB 를 바꾸지 않는 조회라 쿼리로 다룬다.
 *
 * 배송비는 배송지로 정해지므로 주소가 없으면 호출 자체를 하지 않는다 — 빈 주소로 부르면
 * 서버가 400 을 주고, 화면은 "실패"와 "아직 고르지 않았다"를 구분할 수 없게 된다.
 * 주소가 바뀌면 키가 바뀌어 자동으로 다시 확정된다.
 */
export const useOrderPreviewQuery = ({
  cartItemIds,
  city,
  district,
}: UseOrderPreviewQueryParams) => {
  const languageCode = useLanguage();
  const ids = [...cartItemIds];

  return useAppQuery<
    Awaited<ReturnType<typeof postUserOrderPreview>>,
    Error,
    PostUserOrderPreviewRes
  >({
    queryKey: ["order", "preview", ids, city, district, languageCode],
    queryFn: () =>
      postUserOrderPreview({
        cartItemIds: ids,
        city: city ?? "",
        district: district ?? "",
        languageCode,
      }),
    select: (res) => res.data,
    enabled: ids.length > 0 && !!city && !!district,
    // 금액은 확정값이라 오래 들고 있을 이유가 없다. 주문서를 다시 열면 다시 묻는다.
    staleTime: 0,
  });
};
