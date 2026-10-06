import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomTabInset } from "@/constants/theme";

import { MY_MENU_GROUPS, type MyMenuItem } from "../model/menu";

/**
 * 마이페이지(비로그인). 가입 유도 블록 + 구분 밴드 + 그룹별 메뉴.
 * 로그인 상태 화면은 인증 플로우가 생긴 뒤에 붙인다.
 */
export function MyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerStyle={{ paddingBottom: insets.bottom + BottomTabInset }}
      showsVerticalScrollIndicator={false}
    >
      <SignUpPitch />
      {/* 가입 블록과 메뉴를 가르는 띠. 섹션이 아니라 경계라 좌우 여백 없이 깐다. */}
      <View className="bg-surface-muted" style={{ height: 10 }} />
      {MY_MENU_GROUPS.map((group) => (
        <View className="pt-8" key={group.title}>
          <Text className="text-body-3 text-neutral mb-2 px-5">
            {group.title}
          </Text>
          {group.items.map((item) => (
            <MenuRow
              item={item}
              key={item.label}
              onPress={() => router.push(item.href)}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function SignUpPitch() {
  return (
    <View className="px-5 pb-10 pt-12">
      <Text className="text-title-3 text-foreground text-center font-bold">
        Join Seoul Moment
      </Text>
      <Text className="text-body-3 text-neutral mt-3 text-center">
        Save what you like and pick up where you left off, on any device.
      </Text>
      {/* TODO: 인증 플로우가 생기면 로그인 화면으로 보낸다. 지금은 보낼 곳이 없어
          버튼을 비활성으로 둔다 — 눌리는데 아무 일도 없는 상태보다 낫다. */}
      <View
        accessibilityLabel="Sign in or sign up, coming soon"
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        className="bg-foreground mt-8 items-center justify-center rounded-full py-4"
        style={{ opacity: 0.35 }}
      >
        <Text className="text-body-2 text-background font-bold">
          Sign in / Sign up
        </Text>
      </View>
      <Text className="text-body-3 text-neutral mt-3 text-center">
        Coming soon
      </Text>
    </View>
  );
}

function MenuRow({ item, onPress }: { item: MyMenuItem; onPress(): void }) {
  return (
    <Pressable
      accessibilityLabel={item.label}
      accessibilityRole="button"
      className="border-neutral-subtle flex-row items-center justify-between border-b px-5"
      onPress={onPress}
      // 줄 높이를 56 으로 잡아 44pt 최소 터치 영역을 넘긴다.
      style={{ height: 56 }}
    >
      <Text className="text-body-2 text-foreground">{item.label}</Text>
      <Text className="text-body-2 text-neutral">›</Text>
    </Pressable>
  );
}
