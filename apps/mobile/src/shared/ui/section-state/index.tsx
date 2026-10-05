import { Pressable, Text, View } from "react-native";

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
      <Pressable
        accessibilityLabel="Retry loading this section"
        accessibilityRole="button"
        // 글자 한 줄(17pt)뿐이라 8 로는 33pt 에 그친다. 14 로 45pt 를 만든다.
        hitSlop={14}
        onPress={onRetry}
      >
        <Text className="text-body-3 text-brand font-bold">Retry</Text>
      </Pressable>
    </View>
  );
}
