import type { HTTPError } from "ky";

import useAppMutation from "@shared/lib/hooks/query/useAppMutation";
import type { UpdateUserCartItemReq } from "@shared/services/userCart";
import {
  deleteUserCartItem,
  updateUserCartItem,
} from "@shared/services/userCart";

import { useQueryClient } from "@tanstack/react-query";

import { USER_CART_KEY } from "./keys";

/**
 * 장바구니를 고치는 두 가지 — 수량 바꾸기와 줄 지우기. 둘의 캐시 정책은 하나다.
 *
 * **낙관적 갱신을 쓰지 않는다.** 관심 목록의 하트(useOptimisticUnlike)와는 사정이 다르다.
 * 거기서 바뀌는 것은 목록에 있고 없고뿐이지만, 여기서는 한 번 누를 때마다 서버가 계산한
 * 숫자가 여섯 개 움직인다 — 라인 금액, 브랜드 상품 금액, 상품 금액 합, 예상 배송비,
 * 무료배송까지 남은 금액, 예상 결제 금액. 그중 배송비는 기준액을 넘느냐에 따라 0 이 되고
 * 기준액·외섬 규칙은 서버만 안다. 화면에서 흉내 내면 맞는 날보다 틀린 날이 많고, 틀린
 * 금액은 "조금 늦게 맞는 금액"보다 나쁘다.
 *
 * 그래서 성공·실패 어느 쪽이든 서버에 다시 묻는다. 그리고 그 재조회가 끝날 때까지
 * mutation 을 pending 으로 붙잡아 둔다 — onSettled 가 돌려준 Promise 를 react-query 가
 * 기다리기 때문이다. 화면은 그동안 그 줄을 비활성으로 그려서, 사용자가 이미 바꾼 줄 알고
 * 있는 수량과 아직 옛 값인 금액이 한 화면에 같이 있는 순간을 없앤다.
 *
 * 머리 키(USER_CART_KEY) 하나만 무효화하면 목록과 헤더 뱃지 수가 함께 다시 묻는다.
 */
const useCartRefresh = () => {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: USER_CART_KEY });
};

/** 수량 변경. 재고보다 크면 서버가 409 로 거절한다(isNotEnoughStockError). */
export const useUpdateCartItemQuantity = () => {
  const refresh = useCartRefresh();

  return useAppMutation<unknown, HTTPError, UpdateUserCartItemReq>({
    mutationFn: updateUserCartItem,
    onSettled: refresh,
  });
};

/** 줄 삭제. 앱에는 담는 자리가 없어 되돌릴 수 없으므로, 호출부가 먼저 한 번 묻는다. */
export const useRemoveCartItem = () => {
  const refresh = useCartRefresh();

  return useAppMutation<unknown, HTTPError, number>({
    mutationFn: deleteUserCartItem,
    onSettled: refresh,
  });
};
