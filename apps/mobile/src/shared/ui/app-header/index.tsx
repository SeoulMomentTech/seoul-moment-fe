import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CartIcon } from "@shared/ui/icons";
import { Touchable } from "@shared/ui/press";

import { HeaderHeight } from "@/constants/theme";

// className 을 받지 못하는 SVG 라 nativewind --foreground 토큰 값을 직접 쓴다.
const FOREGROUND = "#171717";
const CART_ICON_SIZE = 22;
// 아이콘이 22pt 라 11 로 넓혀 44pt 터치 영역을 맞춘다. 상자를 44 로 키우지 않는 이유는
// 그러면 아이콘이 px-5 오른쪽 선에서 11pt 안으로 들어가 로고와 끝선이 어긋나기 때문이다.
const CART_HIT_SLOP = 11;
/** 뱃지 지름. body-5(12) 한 줄에 위아래 3pt 씩. */
const BADGE_SIZE = 18;
/** 이보다 많으면 정확한 수를 세는 뜻이 없다. 자릿수가 늘어 뱃지가 아이콘을 덮기도 한다. */
const MAX_BADGE_COUNT = 99;

interface AppHeaderProps {
  /**
   * 장바구니 줄 수. **모르면 넘기지 않는다** — 로그아웃·로딩·실패가 모두 여기에 해당한다.
   * 0 과 구분되어야 한다: 0 은 "비었다"는 사실이고 undefined 는 "아직 모른다"이다.
   * 뱃지는 둘 다 그리지 않지만, 읽어 주는 이름은 달라진다.
   */
  cartCount?: number;
}

/**
 * 모든 탭이 공유하는 앱 헤더. 상단 safe-area inset 을 이 컴포넌트가 소유한다.
 *
 * 장바구니 수를 직접 묻지 않고 받는다. shared 는 앱에서 가장 아래 층이라 entities 의
 * 쿼리를 끌어오면 의존이 거꾸로 선다 — 묻는 일은 탭 레이아웃(app 층)이 하고, 여기서는
 * 받은 숫자를 어떻게 보일지만 정한다.
 */
export function AppHeader({ cartCount }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // 뱃지는 "기다리는 것이 있다"고 말하는 표시다. 셀 것이 없으면(0) 그 말이 거짓이고,
  // 아직 모르면(undefined) 아무 말도 할 수 없다. 두 경우 모두 그리지 않는다 —
  // 특히 모를 때의 0 은 "장바구니가 비었다"는 틀린 확언이 된다.
  const hasBadge = cartCount != null && cartCount > 0;

  return (
    <View
      className="bg-background border-neutral-subtle border-b"
      style={{ paddingTop: insets.top }}
    >
      <View
        className="flex-row items-center justify-between px-5"
        style={{ height: HeaderHeight }}
      >
        <Image
          accessibilityLabel="Seoul Moment"
          contentFit="contain"
          source={require("@/assets/images/logo.png")}
          style={{ width: 164, height: 20 }}
        />
        <Touchable
          accessibilityLabel={hasBadge ? `Cart, ${cartCount} items` : "Cart"}
          accessibilityRole="button"
          hitSlop={CART_HIT_SLOP}
          onPress={() => router.push("/cart")}
        >
          <CartIcon color={FOREGROUND} size={CART_ICON_SIZE} />
          {hasBadge ? (
            // 수는 바로 옆 이름("Cart, 3 items")이 이미 말하므로 따로 읽어 주지 않는다.
            <View
              accessibilityElementsHidden
              className="bg-brand absolute items-center justify-center rounded-full"
              importantForAccessibility="no-hide-descendants"
              style={{
                top: -6,
                right: -8,
                height: BADGE_SIZE,
                minWidth: BADGE_SIZE,
                paddingHorizontal: 4,
              }}
            >
              <Text className="text-body-5 text-background font-bold">
                {cartCount > MAX_BADGE_COUNT
                  ? `${MAX_BADGE_COUNT}+`
                  : cartCount}
              </Text>
            </View>
          ) : null}
        </Touchable>
      </View>
    </View>
  );
}
