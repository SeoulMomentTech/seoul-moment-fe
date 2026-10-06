import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";

import { Section } from "@shared/ui/section";
import { SectionError } from "@shared/ui/section-state";
import { NEWS_CARD_HEIGHT, PostSlideSkeleton } from "@shared/ui/skeleton";
import { SlideCarousel } from "@shared/ui/slide-pager/SlideCarousel";

import { NewsSlideCard } from "./PostSlideCards";
import { useHomeNews } from "../model/useHomeLists";

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
        <PostSlideSkeleton variant="news" />
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
    <Section
      action={
        <Pressable
          accessibilityLabel="View all news"
          accessibilityRole="button"
          // 글자 한 줄(17pt)뿐이라 8 로는 33pt 에 그친다. 14 로 45pt 를 만든다.
          hitSlop={14}
          // 탭 라우트라 push 하면 (tabs) 네비게이터가 한 벌 더 쌓인다.
          onPress={() => router.navigate("/news")}
        >
          <Text className="text-body-3 text-brand font-semibold">View all</Text>
        </Pressable>
      }
      title="News"
    >
      <SlideCarousel
        data={news}
        keyExtractor={(item) => String(item.id)}
        renderItem={(item) => (
          <Pressable
            accessibilityLabel={item.title}
            accessibilityRole="button"
            onPress={() => router.push(`/news/${item.id}`)}
            style={{ height: NEWS_CARD_HEIGHT }}
          >
            <NewsSlideCard
              content={item.content}
              createDate={item.createDate}
              imageUrl={item.homeImage}
              title={item.title}
              writer={item.writer}
            />
          </Pressable>
        )}
      />
    </Section>
  );
}
