import { Text, View } from "react-native";

import { Touchable } from "@shared/ui/press";

interface SectionErrorProps {
  onRetry(): void;
}

/**
 * 한 섹션이 실패해도 홈 전체가 죽지 않게, 그 섹션만 한 줄로 접는다.
 */
export function SectionError({ onRetry }: SectionErrorProps) {
  return (
    <View className="border-neutral-subtle mx-5 flex-row items-center justify-between rounded-lg border px-4 py-3">
      <Text className="text-body-3 text-neutral">
        Couldn&apos;t load this section
      </Text>
      <Touchable
        accessibilityLabel="Retry loading this section"
        accessibilityRole="button"
        // 글자 한 줄(17pt)뿐이라 8 로는 33pt 에 그친다. 14 로 45pt 를 만든다.
        hitSlop={14}
        onPress={onRetry}
      >
        <Text className="text-body-3 text-brand font-bold">Retry</Text>
      </Touchable>
    </View>
  );
}

interface ScreenErrorProps {
  onRetry(): void;
  /** 오프라인이라 요청이 멈춘 경우. 문구만 바뀌고 재시도 동작은 같다. */
  offline?: boolean;
}

/**
 * 화면 전체가 실패했을 때. SectionError 는 목록 한 칸짜리 줄이라, 그 줄 하나로
 * 화면을 채우면 빈 흰 종이 위쪽에 45pt 띠가 떠 있는 렌더 사고처럼 보인다.
 * 남은 높이 한가운데에 제목·설명·재시도 알약을 둔다. 알약 모양은 목록 위
 * 'View brand page'(ShopParts) 와 같은 rounded-full 외곽선이다.
 */
export function ScreenError({ onRetry, offline = false }: ScreenErrorProps) {
  return (
    <View className="flex-1 items-center justify-center px-5">
      <Text className="text-title-4 text-foreground text-center font-bold">
        {offline ? "You appear to be offline" : "We couldn't load this page"}
      </Text>
      <Text className="text-body-3 text-neutral mt-2 text-center">
        {offline
          ? "Check your connection and try again."
          : "Please try again in a moment."}
      </Text>
      <Touchable
        accessibilityLabel="Retry loading this page"
        accessibilityRole="button"
        className="border-neutral-subtle mt-6 items-center rounded-full border px-6 py-3"
        onPress={onRetry}
      >
        <Text className="text-body-3 text-foreground font-bold">Retry</Text>
      </Touchable>
    </View>
  );
}
