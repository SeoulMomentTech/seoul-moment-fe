import { StatusBar } from "expo-status-bar";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LegalDocument, type LegalNode } from "@shared/ui/legal-document";
import { ScreenHeader } from "@shared/ui/screen-header";

import { Spacing } from "@/constants/theme";

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

  return (
    <View className="bg-background flex-1">
      <StatusBar style="dark" />
      <ScreenHeader title={title} />
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
