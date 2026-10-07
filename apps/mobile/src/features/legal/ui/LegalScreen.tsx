import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LegalDocument, type LegalNode } from "@shared/ui/legal-document";
import { Touchable } from "@shared/ui/press";

import { HeaderHeight, Spacing } from "@/constants/theme";

/**
 * 약관·개인정보 처리방침 공용 화면. 사진이 없어 상세 화면들과 달리 스크림 없이
 * 흰 배경에 평범한 헤더를 둔다.
 */
export function LegalScreen({
  title,
  document,
}: {
  title: string;
  document: LegalNode;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View className="bg-background flex-1">
      <StatusBar style="dark" />
      <View
        className="border-neutral-subtle border-b"
        style={{ paddingTop: insets.top }}
      >
        <View
          className="flex-row items-center px-5"
          style={{ height: HeaderHeight }}
        >
          <Touchable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={14}
            onPress={() => router.back()}
          >
            <Text className="text-title-4 text-foreground font-bold">‹</Text>
          </Touchable>
          <Text
            className="text-body-2 text-foreground ml-3 flex-1 font-bold"
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: insets.bottom + Spacing.section,
        }}
        showsVerticalScrollIndicator={false}
      >
        <LegalDocument node={document} />
      </ScrollView>
    </View>
  );
}
