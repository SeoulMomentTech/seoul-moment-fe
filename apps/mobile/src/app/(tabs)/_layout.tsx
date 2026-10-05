import { NativeTabs } from "expo-router/unstable-native-tabs";
import { View } from "react-native";

import { AppHeader } from "@/shared/ui/app-header";

// 라이트 모드 고정이라 scheme 분기가 없다. NativeTabs 는 className 이 아니라
// 색 값을 요구하므로 nativewind 클래스 대신 디자인 토큰 값을 상수로 미러링한다.
const TAB_ACTIVE_COLOR = "#f37b2a"; // --brand-500
const TAB_INACTIVE_COLOR = "#707070"; // --neutral-600
const TAB_INDICATOR_COLOR = "rgba(243, 123, 42, 0.14)"; // --brand-500 14% 투명도 (Android 선택 pill)
const TAB_RIPPLE_COLOR = "rgba(243, 123, 42, 0.24)"; // --brand-500 24% 투명도 (Android 터치 ripple, 인디케이터보다 진하게)
const TAB_BACKGROUND_COLOR = "#ffffff"; // --neutral-0

export default function TabLayout() {
  // Material 4탭 이상이면 LABEL_VISIBILITY_AUTO 규칙에 의해 선택된 탭만 라벨을 표시한다.
  return (
    <View className="bg-background flex-1">
      <AppHeader />
      <NativeTabs
        backgroundColor={TAB_BACKGROUND_COLOR}
        iconColor={{ default: TAB_INACTIVE_COLOR, selected: TAB_ACTIVE_COLOR }}
        indicatorColor={TAB_INDICATOR_COLOR}
        labelStyle={{
          default: { color: TAB_INACTIVE_COLOR },
          selected: { color: TAB_ACTIVE_COLOR },
        }}
        labelVisibilityMode="labeled"
        rippleColor={TAB_RIPPLE_COLOR}
      >
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            md="home"
            sf={{ default: "house", selected: "house.fill" }}
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="shop">
          <NativeTabs.Trigger.Label>Shop</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            md="shopping_bag"
            sf={{ default: "bag", selected: "bag.fill" }}
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="news">
          <NativeTabs.Trigger.Label>News</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            md="newspaper"
            sf={{ default: "newspaper", selected: "newspaper.fill" }}
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="my">
          <NativeTabs.Trigger.Label>My</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            md="person"
            sf={{ default: "person", selected: "person.fill" }}
          />
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>
  );
}
