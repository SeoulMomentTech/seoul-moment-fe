import { Image } from "expo-image";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CartButtonView } from "@shared/ui/cart-button";

import { HeaderHeight } from "@/constants/theme";

interface AppHeaderProps {
  /** 장바구니 줄 수. 모를 때 넘기지 않는 규칙은 CartButtonView 가 설명한다. */
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
        <CartButtonView count={cartCount} />
      </View>
    </View>
  );
}
