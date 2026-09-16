"use client";

import { useLanguage } from "@shared/lib/hooks";
import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import {
  postUserOrderPreview,
  type PostUserOrderPreviewReq,
  type PostUserOrderPreviewRes,
} from "@shared/services/userOrder";

import type { LanguageType } from "@/i18n/const";

import { keepPreviousData } from "@tanstack/react-query";

import { toOrderSourceBody, type OrderSource } from "../model/orderSource";

interface UseOrderPreviewQueryParams {
  /** 주문 대상. URL 에 없거나 잘못됐으면 `null` 이고 호출하지 않는다 */
  source: OrderSource | null;
  /** 배송지 縣市. 생략하면 서버가 본섬 기준 예상 배송비를 준다 */
  city?: string;
  /** 배송지 區/鄉 */
  district?: string;
}

/**
 * 주소는 縣市·區 가 함께 있을 때만 보낸다. 서버가 둘을 같이 받아야 지역을 정할 수 있어서
 * 한쪽만 담긴 요청은 아예 만들어지지 않게 분기한다.
 */
const toPreviewRequest = (
  source: OrderSource,
  languageCode: LanguageType,
  city?: string,
  district?: string,
): PostUserOrderPreviewReq =>
  city && district
    ? { ...toOrderSourceBody(source), city, district, languageCode }
    : { ...toOrderSourceBody(source), languageCode };

/**
 * 주문서에 그릴 라인과 금액. POST 이지만 DB 를 바꾸지 않는 조회라 쿼리로 다룬다.
 *
 * 주소가 없어도 부른다 — 서버가 본섬 기준 예상값(`isShippingEstimated`)을 주므로 라인
 * 목록만 먼저 그릴 수 있다. 배송비를 확정으로 쓸지는 화면이 그 플래그를 보고 정한다.
 * 주소가 바뀌면 키가 바뀌어 자동으로 다시 확정된다.
 */
export const useOrderPreviewQuery = ({
  source,
  city,
  district,
}: UseOrderPreviewQueryParams) => {
  const languageCode = useLanguage();

  const request = source
    ? toPreviewRequest(source, languageCode, city, district)
    : null;

  return useAppQuery<
    Awaited<ReturnType<typeof postUserOrderPreview>>,
    Error,
    PostUserOrderPreviewRes
  >({
    queryKey: ["order", "preview", source, city, district, languageCode],
    queryFn: () => {
      // enabled 가 막고 있어 여기서는 요청이 반드시 만들어져 있다
      if (!request) throw new Error("order preview needs an order source");

      return postUserOrderPreview(request);
    },
    select: (res) => res.data,
    enabled: request !== null,
    // 주소를 고치면 키가 바뀐다. 비워 두면 라인 목록까지 사라져 화면 전체가 스켈레톤으로
    // 돌아간다 — 주소를 고르는 동안 주문 상품이 없어졌다 나타난다. 직전 결과를 들고
    // 있다가 새 금액이 오면 갈아끼운다. 그동안은 `isPlaceholderData` 로 알린다.
    placeholderData: keepPreviousData,
    // 금액은 확정값이라 오래 들고 있을 이유가 없다. 주문서를 다시 열면 다시 묻는다.
    staleTime: 0,
  });
};
