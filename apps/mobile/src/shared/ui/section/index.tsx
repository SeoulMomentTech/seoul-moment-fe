import type { PropsWithChildren, ReactNode } from "react";

import { Text, View } from "react-native";

/**
 * plain  — 흰 배경 위 보통 섹션.
 * muted  — 회색 띠. 상세 맨 아래 관련 글처럼 장을 끊는 자리라 아래 여백까지 자기가 쥔다.
 * dark   — 검은 띠. News 의 Hot Keyword.
 */
type SectionTone = "plain" | "muted" | "dark";

// 세로 리듬은 여기 한 곳에서만 정해진다. 섹션 위 간격은 40 하나뿐이다.
// 띠(muted/dark)의 안쪽 여백이 더 좁은 것은 의도다 — 보이는 테두리 안쪽 여백이라
// 보이지 않는 간격만큼 크지 않아도 끊겨 보인다.
const TONE: Record<SectionTone, string> = {
  plain: "pt-10",
  // 앞 본문에 바로 붙인다. 톤이 바뀌는 것 자체가 끊김이라 흰 간격을 더 두지 않는다.
  muted: "bg-surface-muted pb-10 pt-10",
  // 흰 섹션 사이에 끼므로 앞에 흰 간격이 없으면 잘린 것처럼 보인다.
  dark: "bg-foreground mt-10 pb-6 pt-6",
};

interface SectionProps {
  /**
   * 문자열이면 공용 제목 꼴(title-4 bold)로 그린다.
   * 노드를 주면 제목 자리를 통째로 넘긴다 — 두 줄짜리 띠 제목이나 로딩 중 제목 스켈레톤용이고,
   * 이때 제목 줄의 가로 배치는 넘긴 쪽이 책임지므로 action 은 쓰지 않는다.
   * 없으면 제목 줄 자체를 그리지 않는다.
   */
  title?: ReactNode;
  action?: ReactNode;
  tone?: SectionTone;
}

/**
 * 앱의 모든 섹션이 지나는 하나뿐인 틀. 제목 줄의 좌우 여백과 섹션 위 간격만 책임지고,
 * 본문은 섹션마다 자유롭게 둔다(가로 캐러셀은 화면 끝까지 흘러야 해서 본문에 패딩을
 * 강제하지 않는다). 직접 제목을 그리는 섹션을 다시 만들지 말고 tone 을 늘려서 쓴다.
 */
export function Section({
  title,
  action,
  tone = "plain",
  children,
}: PropsWithChildren<SectionProps>) {
  return (
    <View className={TONE[tone]}>
      {title === undefined ? null : typeof title === "string" ? (
        <View className="mb-4 flex-row items-end justify-between px-5">
          <Text
            className={
              tone === "dark"
                ? "text-title-4 text-background font-bold"
                : "text-title-4 text-foreground font-bold"
            }
          >
            {title}
          </Text>
          {action}
        </View>
      ) : (
        <View className="mb-4 px-5">{title}</View>
      )}
      {children}
    </View>
  );
}
