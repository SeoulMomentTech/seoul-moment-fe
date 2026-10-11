import { useLocalSearchParams } from "expo-router";

import { OrderScreen } from "@features/order";

/**
 * 주문할 장바구니 라인은 주소가 들고 온다(`/order?cart=1,2,3`).
 * 숫자가 아닌 값이 섞이면 그것만 버린다 — 고르지 않은 것을 주문하는 것보다 낫고,
 * 소유자·재고 판정은 어차피 서버가 다시 한다.
 */
export default function Order() {
  const { cart } = useLocalSearchParams<{ cart?: string }>();

  const cartItemIds = (cart ?? "")
    .split(",")
    .map((value) => Number(value))
    .filter((id) => Number.isInteger(id) && id > 0);

  return <OrderScreen cartItemIds={cartItemIds} />;
}
