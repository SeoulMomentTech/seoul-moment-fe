import { Text, View } from "react-native";

import {
  PASSWORD_RULES,
  PASSWORD_RULE_LABELS,
} from "@shared/lib/utils/password";
import { CheckIcon } from "@shared/ui/icons";

import { Spacing } from "@/constants/theme";

const ICON_SIZE = 14;
// SVG 는 className 을 못 받아 토큰 값을 직접 쓴다.
const MET = "#171717"; // --foreground
const UNMET = "#dddddd"; // --neutral-200 (꺼진 표시는 글자보다 더 물러나 있어야 한다)
const ROW_GAP = 6;

/**
 * 비밀번호가 지켜야 하는 다섯 줄. 가입과 비밀번호 재설정이 같이 쓴다 —
 * 두 화면이 같은 규칙을 받으므로 보여 주는 모양도 하나여야 한다.
 *
 * 다섯 줄이 늘 같은 자리에 있고 색만 바뀐다. 지킨 줄이 사라지게 하면 무엇을 이미
 * 지켰는지 다시 셀 수 없고, 줄 수가 줄면서 아래 버튼이 올라온다.
 */
export function PasswordChecklist({ value }: { value: string }) {
  return (
    <View style={{ gap: ROW_GAP }}>
      {PASSWORD_RULE_LABELS.map(({ key, label }) => {
        const met = PASSWORD_RULES[key](value);

        return (
          <View className="flex-row items-center" key={key}>
            {/* 체크는 읽는 것이 아니라 켜짐·꺼짐이라 낭독기에서 숨긴다 —
                상태는 글자 쪽 accessibilityLabel 이 말한다. */}
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={{ width: ICON_SIZE + ROW_GAP }}
            >
              <CheckIcon color={met ? MET : UNMET} size={ICON_SIZE} />
            </View>
            <Text
              accessibilityLabel={`${label}${met ? ", met" : ", not met"}`}
              className={
                met
                  ? "text-body-5 text-foreground flex-1"
                  : "text-body-5 text-neutral flex-1"
              }
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/** 체크리스트 위에 두는 간격. 입력 칸 묶음과 한 덩어리로 읽히게 붙인다. */
export const PASSWORD_CHECKLIST_TOP = Spacing.inner;
