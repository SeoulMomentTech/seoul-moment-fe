import { useState } from "react";

import { useRouter } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  isProductSoldOut,
  listProductVariantChoices,
} from "@entities/product/lib/variantChoices";
import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import type { GetProductDetailRes } from "@shared/services/product";
import { BUTTON_HEIGHT, Button } from "@shared/ui/button";

import { Spacing } from "@/constants/theme";

import { AddToCartSheet } from "./AddToCartSheet";

/** 바가 가리는 높이. 상세 본문이 마지막 줄까지 보이도록 이만큼 아래를 비워 둔다. */
export const ADD_TO_CART_BAR_HEIGHT = BUTTON_HEIGHT.lg + Spacing.tight * 2 + 1;

/**
 * 상세 맨 아래에 떠 있는 담기 바. 스크롤과 무관하게 늘 같은 자리에 있다 —
 * 상세 이미지가 길어서, 본문 흐름에 두면 끝까지 내려야 담을 수 있다.
 *
 * 로그인하지 않았으면 담기 대신 로그인으로 보낸다. 게스트 장바구니는 쓰지 않으므로
 * 담을 곳 자체가 없고, 누르고 나서 "로그인하세요"를 보는 것보다 바로 가는 편이 짧다.
 */
export function AddToCartBar({ product }: { product: GetProductDetailRes }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const [sheetOpen, setSheetOpen] = useState(false);
  /**
   * 열 때마다 시트를 새로 마운트하는 키. 시트의 고른 조합·수량·담기 결과는 BottomSheet 의
   * children 바깥에 있어서 session 키가 닿지 않는다 — 그대로 두면 한 번 담고 다시 열었을 때
   * 확인 화면이 그대로 떠 있다. 닫을 때는 키를 그대로 둬야 닫힘 애니메이션이 살아 있다.
   */
  const [openCount, setOpenCount] = useState(0);

  const variants = product.variants ?? [];
  const choices = listProductVariantChoices({
    option: product.option,
    variants,
  });
  // 조합을 하나도 못 받은 상품은 담을 수단이 없다(서버가 조합 id 를 요구한다).
  // 품절과는 다른 사정이라 글자도 다르게 적는다.
  const hasChoices = choices.length > 0;
  const soldOut = isProductSoldOut(variants);

  const label = !hasChoices
    ? "Unavailable"
    : soldOut
      ? "Sold out"
      : "Add to cart";

  return (
    <>
      {/* 스크롤 뷰 위에 띄운다. 흐름 안에 두면 ScrollView 가 남은 높이를 어떻게 잡느냐에
          따라 바가 화면 밖으로 밀릴 수 있어서, 뒤로가기·스크림과 같은 고정 배치로 둔다. */}
      <View
        className="border-neutral-subtle bg-background border-t px-5"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingTop: Spacing.tight,
          paddingBottom: Spacing.tight + insets.bottom,
        }}
      >
        <Button
          accessibilityLabel={`${label}: ${product.name}`}
          disabled={!hasChoices || soldOut}
          label={label}
          onPress={() => {
            if (!isAuthenticated) {
              router.push("/login");
              return;
            }
            setOpenCount((n) => n + 1);
            setSheetOpen(true);
          }}
        />
      </View>
      {/* 시트는 로그인한 사람만 연다. 열릴 때마다 내부 상태가 새로 시드된다. */}
      <AddToCartSheet
        choices={choices}
        key={openCount}
        onClose={() => setSheetOpen(false)}
        productName={product.name}
        visible={sheetOpen}
      />
    </>
  );
}
