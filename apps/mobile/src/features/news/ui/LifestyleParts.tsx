import { ActivityIndicator, View } from "react-native";

import { Section } from "@shared/ui/section";
import { SectionError } from "@shared/ui/section-state";
import { PostListSkeleton } from "@shared/ui/skeleton";

import { useInfiniteNewsByCategory } from "../model/useInfiniteNewsByCategory";

/** 제목 줄. 로딩·에러·오프라인에서도 같은 자리를 지킨다. */
function LifestyleTitle() {
  return (
    <Section title="Lifestyle">
      <View />
    </Section>
  );
}

/**
 * Lifestyle 제목. 첫 페이지가 비어 있으면(로딩·에러 아님) 제목도 숨긴다.
 */
export function LifestyleHeader() {
  const { data, isPending, isError, fetchStatus } = useInfiniteNewsByCategory();

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다. 재시도 줄은 목록 자리의
  // LifestyleEmpty 가 그리므로, 여기서는 제목을 빈 목록으로 오해해 숨기지 않기만 하면 된다.
  if (isPending && fetchStatus === "paused") return <LifestyleTitle />;

  if (isPending || isError) return <LifestyleTitle />;

  if (!data || data.length === 0) return null;

  return <LifestyleTitle />;
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

  if (isPending) return <PostListSkeleton />;

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
