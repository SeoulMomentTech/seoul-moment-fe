import { NativeTabs } from "expo-router/unstable-native-tabs";

import { Colors } from "@/constants/theme";

// 라이트 모드 고정이라 scheme 분기가 없다. NativeTabs 는 className 이 아니라
// 색 값을 요구하므로 nativewind 토큰 대신 Colors 를 쓴다.
const colors = Colors.light;

export default function TabLayout() {
  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}
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
  );
}
