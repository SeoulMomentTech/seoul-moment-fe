import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CartButtonView, type CartButtonTone } from "@shared/ui/cart-button";

import { useUserCartCount } from "../model/useUserCartCount";

/** 사진 위에 떠 있을 때의 위쪽 여백. 떠 있는 뒤로가기(detail-chrome)와 같은 값이다. */
const OVERLAY_TOP = 8;

/**
 * 수까지 스스로 묻는 장바구니 단추. 머리마다 숫자를 받아 넘기지 않아도 되도록
 * 이 층에서 쿼리를 쥔다 — 로그아웃 상태면 요청 자체가 나가지 않는다.
 *
 * overlay 는 사진으로 시작하는 상세 화면(상품·브랜드·프로모션·뉴스)에서 쓴다.
 * 뒤로가기와 같은 높이에 반대쪽 끝으로 선다.
 */
export function CartButton({ tone = "plain" }: { tone?: CartButtonTone }) {
  const insets = useSafeAreaInsets();
  const { data } = useUserCartCount();

  if (tone !== "overlay") {
    return <CartButtonView count={data} tone={tone} />;
  }

  return (
    <View
      className="absolute right-5"
      style={{ top: insets.top + OVERLAY_TOP }}
    >
      <CartButtonView count={data} tone="overlay" />
    </View>
  );
}
