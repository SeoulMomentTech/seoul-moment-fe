import { NativeTabs } from "expo-router/unstable-native-tabs";
import { View } from "react-native";

import { Colors } from "@/constants/theme";
import { AppHeader } from "@/shared/ui/app-header";

// 라이트 모드 고정이라 scheme 분기가 없다. NativeTabs 는 className 이 아니라
// 색 값을 요구하므로 nativewind 토큰 대신 Colors 를 쓴다.
const colors = Colors.light;

export default function TabLayout() {
  // Material 4탭 이상이면 LABEL_VISIBILITY_AUTO 규칙에 의해 선택된 탭만 라벨을 표시한다.
  return (
    <View className="bg-background flex-1">
      <AppHeader />
      <NativeTabs
        backgroundColor={colors.background}
        iconColor={{ default: colors.textSecondary, selected: colors.text }}
        indicatorColor={colors.backgroundElement}
        labelStyle={{
          default: { color: colors.textSecondary },
          selected: { color: colors.text },
        }}
        labelVisibilityMode="labeled"
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
