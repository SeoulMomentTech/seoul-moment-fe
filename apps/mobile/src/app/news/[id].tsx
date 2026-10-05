import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { formatDate } from "@shared/lib/utils/formatDate";
import type { NewsDetailSection } from "@shared/services/news";
import { SectionError, SectionSkeleton } from "@shared/ui/section-state";

import { useNewsDetail } from "@features/news";

const BANNER_HEIGHT = 240;
const SECTION_IMAGE_HEIGHT = 220;

function BackButton() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityLabel="Go back"
      accessibilityRole="button"
      className="px-5 pb-3"
      hitSlop={8}
      onPress={() => router.back()}
      style={{ paddingTop: insets.top + 8 }}
    >
      <Text className="text-body-1 text-foreground font-bold">‹ Back</Text>
    </Pressable>
  );
}

function ArticleSection({ section }: { section: NewsDetailSection }) {
  return (
    <View className="mt-8 px-5">
      {section.title ? (
        <Text className="text-title-4 text-foreground font-bold">
          {section.title}
        </Text>
      ) : null}
      {section.subTitle ? (
        <Text className="text-body-2 text-neutral mt-1">
          {section.subTitle}
        </Text>
      ) : null}
      {section.imageList.map((uri, index) => (
        <Image
          contentFit="cover"
          // 정적 목록이라 순서가 바뀌지 않으므로 index 키가 안전하다.
          // eslint-disable-next-line react/no-array-index-key
          key={`${index}-${uri}`}
          source={uri}
          style={{
            width: "100%",
            height: SECTION_IMAGE_HEIGHT,
            borderRadius: 12,
            marginTop: 16,
          }}
          transition={200}
        />
      ))}
      {section.content ? (
        <Text className="text-body-2 text-foreground mt-4">
          {section.content}
        </Text>
      ) : null}
    </View>
  );
}

export default function NewsDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Number(rawId);
  const isValidId = Number.isFinite(id);
  const {
    data: news,
    isPending,
    isError,
    fetchStatus,
    refetch,
  } = useNewsDetail(id);

  // 잘못된 id 는 쿼리가 enabled=false 로 idle 에 머문다. 스켈레톤 대신 에러를 보여준다.
  if (!isValidId) {
    return (
      <View className="bg-background flex-1">
        <BackButton />
        <SectionError onRetry={() => void refetch()} />
      </View>
    );
  }

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다. 스켈레톤을 영원히
  // 돌리지 말고 재시도 줄을 보여준다.
  if (isPending && fetchStatus === "paused") {
    return (
      <View className="bg-background flex-1">
        <BackButton />
        <SectionError onRetry={() => void refetch()} />
      </View>
    );
  }

  if (isPending) {
    return (
      <View className="bg-background flex-1">
        <BackButton />
        <SectionSkeleton height={BANNER_HEIGHT} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="bg-background flex-1">
        <BackButton />
        <SectionError onRetry={() => void refetch()} />
      </View>
    );
  }

  const byline = [news.writer, formatDate(news.createDate)]
    .filter(Boolean)
    .join(" · ");

  return (
    <View className="bg-background flex-1">
      <BackButton />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Image
          contentFit="cover"
          source={news.banner}
          style={{ width: "100%", height: BANNER_HEIGHT }}
          transition={200}
        />
        <View className="mt-5 px-5">
          {news.category ? (
            <View className="bg-surface-soft mb-3 self-start rounded-full px-3 py-1">
              <Text className="text-body-3 text-foreground">
                {news.category}
              </Text>
            </View>
          ) : null}
          <Text className="text-title-3 text-foreground font-bold">
            {news.title}
          </Text>
          {byline ? (
            <Text className="text-body-3 text-neutral mt-2">{byline}</Text>
          ) : null}
          <Text className="text-body-2 text-foreground mt-4">
            {news.content}
          </Text>
        </View>
        {news.section.map((section, index) => (
          <ArticleSection
            // 정적 목록이라 순서가 바뀌지 않으므로 index 키가 안전하다.
            // eslint-disable-next-line react/no-array-index-key
            key={`${index}-${section.title}`}
            section={section}
          />
        ))}
      </ScrollView>
    </View>
  );
}
