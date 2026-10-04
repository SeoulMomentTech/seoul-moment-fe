import type { PropsWithChildren, ReactNode } from "react";

import { Text, View } from "react-native";

interface SectionProps {
  title: string;
  action?: ReactNode;
}

/**
 * 홈 섹션 공용 틀. 제목 줄의 좌우 여백만 책임지고, 본문은 섹션마다 자유롭게 둔다
 * (가로 캐러셀은 화면 끝까지 흘러야 해서 본문에 패딩을 강제하지 않는다).
 */
export function Section({
  title,
  action,
  children,
}: PropsWithChildren<SectionProps>) {
  return (
    <View className="pt-10">
      <View className="mb-4 flex-row items-end justify-between px-5">
        <Text className="text-title-4 text-foreground font-bold">{title}</Text>
        {action}
      </View>
      {children}
    </View>
  );
}
