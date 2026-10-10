import { Text, View } from "react-native";

import type { BrandPromotionNotice } from "@shared/services/brandPromotion";
import { Section } from "@shared/ui/section";

import { Spacing } from "@/constants/theme";

export const NOTICE_LINE_HEIGHT = 20;
export const NOTICE_GAP = Spacing.tight;

/**
 * 프로모션 공지. 페이지의 마지막 블록이라 회색 띠로 받아 장을 끊는다 —
 * 웹도 여기서 bg-neutral-50 으로 바닥을 깐다.
 *
 * 줄 수를 묶지 않는다. 지켜야 할 조건이 적힌 글이라 잘라 버릴 수 없고,
 * 아래에 아무것도 없어서 높이가 늘어도 밀리는 것이 없다.
 */
export function PromotionNotices({
  noticeList,
}: {
  noticeList: BrandPromotionNotice[];
}) {
  if (noticeList.length === 0) return null;

  return (
    <Section title="Notice" tone="muted">
      <View className="px-5" style={{ gap: NOTICE_GAP }}>
        {noticeList.map((notice) => (
          <View className="flex-row" key={notice.id}>
            {/* 불릿은 읽는 것이 아니라 줄을 가르는 것이라 낭독기에서 숨긴다. */}
            <Text
              accessibilityElementsHidden
              className="text-body-3 text-neutral"
              importantForAccessibility="no-hide-descendants"
              style={{ lineHeight: NOTICE_LINE_HEIGHT, width: 16 }}
            >
              •
            </Text>
            <Text
              className="text-body-3 text-neutral flex-1"
              style={{ lineHeight: NOTICE_LINE_HEIGHT }}
            >
              {notice.content}
            </Text>
          </View>
        ))}
      </View>
    </Section>
  );
}
