import { ActivityIndicator, View } from "react-native";

import { Section } from "@shared/ui/section";
import { SectionError, SectionSkeleton } from "@shared/ui/section-state";

import { useInfiniteNewsByCategory } from "../model/useInfiniteNewsByCategory";

const LIFESTYLE_HEIGHT = 290;

/**
 * Lifestyle 제목. 첫 페이지가 비어 있으면(로딩·에러 아님) 제목도 숨긴다.
 */
export function LifestyleHeader() {
  const { data, isPending, isError } = useInfiniteNewsByCategory();

  if (!isPending && !isError && (!data || data.length === 0)) return null;

  return (
    <Section title="Lifestyle">
      <View />
    </Section>
  );
}

/**
 * Lifestyle 목록이 비어 있을 때만 FlatList 가 그린다. 가드 순서는 홈 섹션과 같다.
 */
export function LifestyleEmpty() {
  const { isPending, isError, fetchStatus, refetch } =
    useInfiniteNewsByCategory();

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (isPending && fetchStatus === "paused") {
    return <SectionError onRetry={() => void refetch()} />;
  }

  if (isPending) return <SectionSkeleton height={LIFESTYLE_HEIGHT} />;

  if (isError) return <SectionError onRetry={() => void refetch()} />;

  return null;
}

export function LifestyleFooter() {
  const { isFetchingNextPage } = useInfiniteNewsByCategory();

  if (!isFetchingNextPage) return null;

  return (
    <View className="py-6">
      <ActivityIndicator />
    </View>
  );
}
