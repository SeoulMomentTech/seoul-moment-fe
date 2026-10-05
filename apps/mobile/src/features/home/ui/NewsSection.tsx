import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { PostRow } from "@entities/post/ui/PostRow";
import { Section } from "@shared/ui/section";
import { SectionError, SectionSkeleton } from "@shared/ui/section-state";

import { useHomeNews } from "../model/useHomeLists";

const LIST_HEIGHT = 290;

export function NewsSection() {
  const router = useRouter();
  const {
    data: news,
    isPending,
    isError,
    fetchStatus,
    refetch,
  } = useHomeNews();

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다. 스켈레톤을 영원히
  // 돌리지 말고 재시도 줄을 보여준다.
  if (isPending && fetchStatus === "paused") {
    return (
      <Section title="News">
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  if (isPending) {
    return (
      <Section title="News">
        <SectionSkeleton height={LIST_HEIGHT} />
      </Section>
    );
  }

  if (isError) {
    return (
      <Section title="News">
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  if (!news || news.length === 0) return null;

  return (
    <Section title="News">
      <View>
        {news.map((item) => (
          <Pressable
            accessibilityLabel={item.title}
            accessibilityRole="button"
            key={item.id}
            onPress={() => router.push(`/news/${item.id}`)}
          >
            <PostRow
              createDate={item.createDate}
              imageUrl={item.homeImage}
              title={item.title}
              writer={item.writer}
            />
          </Pressable>
        ))}
      </View>
    </Section>
  );
}
