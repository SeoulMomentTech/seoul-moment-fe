import { View } from "react-native";

import { EmptyState } from "@shared/ui/section-state";

import { useHomeIsEmpty } from "../model/useHomeIsEmpty";

/**
 * 다섯 섹션이 모두 빈 응답일 때만 그린다. 섹션들이 이미 전부 null 이라 이 블록이
 * 화면의 유일한 내용이 되므로, 위쪽에 여백을 줘 흰 종이 맨 위에 붙지 않게 한다.
 */
export function HomeEmpty() {
  const isEmpty = useHomeIsEmpty();

  if (!isEmpty) return null;

  return (
    <View className="pt-16">
      <EmptyState hint="Pull down to refresh." message="Nothing here yet" />
    </View>
  );
}
