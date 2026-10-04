import { Pressable, Text, View } from "react-native";

interface SectionSkeletonProps {
  height: number;
}

/**
 * 섹션이 로딩 중일 때 자리를 잡아 둔다. 실제 콘텐츠와 높이를 맞춰야
 * 데이터가 도착할 때 레이아웃이 점프하지 않는다.
 */
export function SectionSkeleton({ height }: SectionSkeletonProps) {
  return (
    <View className="bg-neutral-subtle mx-5 rounded-lg" style={{ height }} />
  );
}

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
      <Pressable hitSlop={8} onPress={onRetry}>
        <Text className="text-body-3 text-brand font-bold">Retry</Text>
      </Pressable>
    </View>
  );
}
