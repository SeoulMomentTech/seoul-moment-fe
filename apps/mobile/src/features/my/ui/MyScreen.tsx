import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUserAuthStore } from "@shared/lib/auth/useUserAuthStore";
import { Button } from "@shared/ui/button";
import { Touchable } from "@shared/ui/press";
import { Section } from "@shared/ui/section";

import { BottomTabInset } from "@/constants/theme";

import { MY_MENU_GROUPS, type MyMenuItem } from "../model/menu";

/**
 * 마이페이지. 가입 유도(또는 로그인 상태) 블록 + 구분 밴드 + 그룹별 메뉴.
 * 메뉴는 아직 로그인 여부와 무관하다 — 계정이 필요한 항목이 생기면 그때 갈린다.
 */
export function MyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerStyle={{ paddingBottom: insets.bottom + BottomTabInset }}
      showsVerticalScrollIndicator={false}
    >
      {isAuthenticated ? <SignedInHeader /> : <SignUpPitch />}
      {/* 가입 블록과 메뉴를 가르는 띠. 섹션이 아니라 경계라 좌우 여백 없이 깐다. */}
      <View className="bg-surface-muted" style={{ height: 10 }} />
      {MY_MENU_GROUPS.map((group) => (
        <Section key={group.title} title={group.title}>
          {group.items.map((item) => (
            <MenuRow
              item={item}
              key={item.label}
              onPress={() => router.push(item.href)}
            />
          ))}
        </Section>
      ))}
    </ScrollView>
  );
}

function SignUpPitch() {
  const router = useRouter();

  return (
    <View className="px-5 pb-10 pt-12">
      <Text className="text-title-3 text-foreground text-center font-bold">
        Join Seoul Moment
      </Text>
      <Text className="text-body-3 text-neutral mt-3 text-center">
        Save what you like and pick up where you left off, on any device.
      </Text>
      <Button
        className="mt-8"
        label="Sign in"
        onPress={() => router.push("/login")}
      />
    </View>
  );
}

/**
 * 로그인 상태의 최소 블록. 프로필 API 를 아직 붙이지 않아 보여 줄 정보가 없고,
 * 로그인이 아무것도 바꾸지 않는 것처럼 보이지 않게 상태와 로그아웃만 둔다.
 */
function SignedInHeader() {
  const logout = useUserAuthStore((s) => s.logout);

  return (
    <View className="px-5 pb-10 pt-12">
      <Text className="text-title-3 text-foreground text-center font-bold">
        You&apos;re signed in
      </Text>
      <Button
        className="mt-8"
        label="Sign out"
        onPress={logout}
        variant="secondary"
      />
    </View>
  );
}

function MenuRow({ item, onPress }: { item: MyMenuItem; onPress(): void }) {
  return (
    <Touchable
      accessibilityLabel={item.label}
      accessibilityRole="button"
      className="border-neutral-subtle flex-row items-center justify-between border-b px-5"
      onPress={onPress}
      // 줄 높이를 56 으로 잡아 44pt 최소 터치 영역을 넘긴다.
      style={{ height: 56 }}
    >
      <Text className="text-body-2 text-foreground">{item.label}</Text>
      <Text className="text-body-2 text-neutral">›</Text>
    </Touchable>
  );
}
