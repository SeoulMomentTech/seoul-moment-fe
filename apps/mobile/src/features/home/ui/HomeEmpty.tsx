import { View } from "react-native";

import { EMPTY_ICON_SIZE, InboxIcon } from "@shared/ui/icons";
import { EmptyState } from "@shared/ui/section-state"; // --neutral-600

import { useHomeIsEmpty } from "../model/useHomeIsEmpty";

const EMPTY_ICON_COLOR = "#707070";

/**
 * 다섯 섹션이 모두 빈 응답일 때만 그린다. 섹션들이 이미 전부 null 이라 이 블록이
 * 화면의 유일한 내용이 되므로, 위쪽에 여백을 줘 흰 종이 맨 위에 붙지 않게 한다.
 */
export function HomeEmpty() {
  const isEmpty = useHomeIsEmpty();

  if (!isEmpty) return null;

  return (
    <View className="pt-16">
      <EmptyState
        hint="Pull down to refresh."
        icon={<InboxIcon color={EMPTY_ICON_COLOR} size={EMPTY_ICON_SIZE} />}
        message="Nothing here yet"
      />
    </View>
  );
}
