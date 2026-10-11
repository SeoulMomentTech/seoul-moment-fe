import type { TabListProps, TabTriggerSlotProps } from "expo-router/ui";
import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";
import { Text, View } from "react-native";

import { useTranslations } from "@shared/lib/i18n/useTranslations";
import { Touchable } from "@shared/ui/press";

import { useResetShopFilterOnLeave } from "@features/shop";

export default function TabLayout() {
  const t = useTranslations();

  useResetShopFilterOnLeave();

  return (
    <Tabs>
      <TabSlot style={{ height: "100%" }} />
      <TabList asChild>
        <WebTabList>
          <TabTrigger asChild href="/" name="index">
            <TabButton>{t("home")}</TabButton>
          </TabTrigger>
          <TabTrigger asChild href="/shop" name="shop">
            <TabButton>{t("shop")}</TabButton>
          </TabTrigger>
          <TabTrigger asChild href="/news" name="news">
            <TabButton>{t("news")}</TabButton>
          </TabTrigger>
          <TabTrigger asChild href="/my" name="my">
            <TabButton>{t("my_account")}</TabButton>
          </TabTrigger>
        </WebTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Touchable {...props}>
      <View className="rounded-lg px-4 py-1">
        <Text
          className={
            isFocused
              ? "text-body-3 text-foreground font-bold"
              : "text-body-3 text-neutral"
          }
        >
          {children}
        </Text>
      </View>
    </Touchable>
  );
}

function WebTabList(props: TabListProps) {
  return (
    <View
      {...props}
      className="border-neutral-subtle bg-background absolute bottom-0 w-full flex-row items-center justify-center gap-2 border-t py-3"
    />
  );
}
