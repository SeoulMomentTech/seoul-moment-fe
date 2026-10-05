import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Dimensions, FlatList, Pressable, Text, View } from "react-native";

import { PostRow } from "@entities/post/ui/PostRow";
import { formatDate } from "@shared/lib/utils/formatDate";
import type { NewsWithCategory } from "@shared/services/news";
import { Section } from "@shared/ui/section";
import { SectionError } from "@shared/ui/section-state";
import {
  BannerSkeleton,
  HorizontalCardsSkeleton,
  PostListSkeleton,
} from "@shared/ui/skeleton";

import { useNewsDashboard } from "../model/useNewsDashboard";

const FEATURED_HEIGHT = 220;
const PICK_WIDTH = Math.round(Dimensions.get("window").width * 0.72);
const PICK_HEIGHT = 160;

function NewsLink({
  id,
  title,
  children,
}: {
  id: number;
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityLabel={title}
      accessibilityRole="button"
      onPress={() => router.push(`/news/${id}`)}
    >
      {children}
    </Pressable>
  );
}

const byline = (item: NewsWithCategory) =>
  [item.writer, formatDate(item.createDate)].filter(Boolean).join(" · ");

export function NewsDashboardSections() {
  return (
    <>
      <FeaturedSection />
      <LatestSection />
      <EditorPickSection />
      <HotKeywordSection />
    </>
  );
}

function CategoryPill({ name }: { name: string }) {
  if (!name) return null;
  return (
    <View className="bg-surface-soft mb-2 self-start rounded-full px-3 py-1">
      <Text className="text-body-3 text-foreground" numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

function FeaturedSection() {
  const { data, isPending, isError, fetchStatus, refetch } = useNewsDashboard();

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다. 스켈레톤을 영원히
  // 돌리지 말고 재시도 줄을 보여준다.
  if (isPending && fetchStatus === "paused") {
    return (
      <Section title="Featured">
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  if (isPending) {
    return (
      <Section title="Featured">
        <BannerSkeleton height={FEATURED_HEIGHT} inset />
      </Section>
    );
  }

  if (isError) {
    return (
      <Section title="Featured">
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  const featured = data?.recentList?.[0];
  if (!featured) return null;

  return (
    <Section title="Featured">
      <NewsLink id={featured.id} title={featured.title}>
        <View className="px-5">
          <Image
            contentFit="cover"
            source={featured.image}
            style={{ width: "100%", height: FEATURED_HEIGHT, borderRadius: 12 }}
            transition={200}
          />
          <View className="mt-3">
            <CategoryPill name={featured.newsCategoryName} />
            <Text
              className="text-body-1 text-foreground font-bold"
              numberOfLines={2}
            >
              {featured.title}
            </Text>
            <Text className="text-body-3 text-neutral mt-1" numberOfLines={1}>
              {byline(featured)}
            </Text>
          </View>
        </View>
      </NewsLink>
    </Section>
  );
}

function LatestSection() {
  const { data, isPending, isError, fetchStatus, refetch } = useNewsDashboard();

  if (isPending && fetchStatus === "paused") {
    return (
      <Section title="Latest">
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  if (isPending) {
    return (
      <Section title="Latest">
        <PostListSkeleton />
      </Section>
    );
  }

  if (isError) {
    return (
      <Section title="Latest">
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  const latest = data?.recentList?.slice(1) ?? [];
  if (latest.length === 0) return null;

  return (
    <Section title="Latest">
      <View>
        {latest.map((item) => (
          <NewsLink id={item.id} key={item.id} title={item.title}>
            <PostRow
              createDate={item.createDate}
              imageUrl={item.homeImage}
              title={item.title}
              writer={item.writer}
            />
          </NewsLink>
        ))}
      </View>
    </Section>
  );
}

function PickCard({ item }: { item: NewsWithCategory }) {
  return (
    <NewsLink id={item.id} title={item.title}>
      <View style={{ width: PICK_WIDTH }}>
        <Image
          contentFit="cover"
          source={item.homeImage}
          style={{ width: "100%", height: PICK_HEIGHT, borderRadius: 12 }}
          transition={200}
        />
        <Text
          className="text-body-3 text-foreground mt-2 font-bold"
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text className="text-body-3 text-neutral mt-1" numberOfLines={1}>
          {byline(item)}
        </Text>
      </View>
    </NewsLink>
  );
}

function EditorPickSection() {
  const { data, isPending, isError, fetchStatus, refetch } = useNewsDashboard();

  if (isPending && fetchStatus === "paused") {
    return (
      <Section title="Editor's Pick">
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  if (isPending) {
    return (
      <Section title="Editor's Pick">
        <HorizontalCardsSkeleton />
      </Section>
    );
  }

  if (isError) {
    return (
      <Section title="Editor's Pick">
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  const picks = data?.editorPickList ?? [];
  if (picks.length === 0) return null;

  return (
    <Section title="Editor's Pick">
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        data={picks}
        horizontal
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <PickCard item={item} />}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={PICK_WIDTH + 12}
      />
    </Section>
  );
}

// 웹의 Hot Keyword 띠는 어두운 배경인데 이 토큰 세트에는 어두운 색이 없다.
// 그래서 이 블록만 --foreground 값(#171717)과 흰 글씨를 raw 값으로 쓴다.
const BAND_BG = "#171717";
const BAND_TEXT = "#ffffff";

function BandShell({ children }: { children: React.ReactNode }) {
  return (
    <View className="mt-10 py-8" style={{ backgroundColor: BAND_BG }}>
      {children}
    </View>
  );
}

// SectionError 는 흰 배경 기준이라 어두운 띠에서는 대비가 낮다. 띠 전용 행을 쓴다.
function BandError({ onRetry }: { onRetry(): void }) {
  return (
    <View
      className="mx-5 flex-row items-center justify-between rounded-lg border px-4 py-3"
      style={{ borderColor: BAND_TEXT }}
    >
      <Text className="text-body-3" style={{ color: BAND_TEXT }}>
        Couldn&apos;t load this section
      </Text>
      <Pressable hitSlop={8} onPress={onRetry}>
        <Text className="text-body-3 text-brand font-bold">Retry</Text>
      </Pressable>
    </View>
  );
}

function HotKeywordSection() {
  const { data, isPending, isError, fetchStatus, refetch } = useNewsDashboard();

  if (isPending && fetchStatus === "paused") {
    return (
      <BandShell>
        <BandError onRetry={() => void refetch()} />
      </BandShell>
    );
  }

  if (isPending) {
    return (
      <BandShell>
        <HorizontalCardsSkeleton />
      </BandShell>
    );
  }

  if (isError) {
    return (
      <BandShell>
        <BandError onRetry={() => void refetch()} />
      </BandShell>
    );
  }

  const hashtag = data?.hashtag;
  if (!hashtag || !hashtag.list || hashtag.list.length === 0) return null;

  return (
    <BandShell>
      <View className="mb-4 px-5">
        <Text
          className="text-body-3 font-bold"
          numberOfLines={1}
          style={{ color: BAND_TEXT, opacity: 0.7 }}
        >
          Hot Keyword
        </Text>
        <Text
          className="text-title-3 mt-1 font-bold"
          numberOfLines={1}
          style={{ color: BAND_TEXT }}
        >
          {`#${hashtag.name}`}
        </Text>
      </View>
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        data={hashtag.list}
        horizontal
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <NewsLink id={item.id} title={item.title}>
            <View style={{ width: PICK_WIDTH }}>
              <Image
                contentFit="cover"
                source={item.homeImage}
                style={{ width: "100%", height: PICK_HEIGHT, borderRadius: 12 }}
                transition={200}
              />
              <Text
                className="text-body-3 mt-2 font-bold"
                numberOfLines={2}
                style={{ color: BAND_TEXT }}
              >
                {item.title}
              </Text>
              <Text
                className="text-body-3 mt-1"
                numberOfLines={1}
                style={{ color: BAND_TEXT, opacity: 0.7 }}
              >
                {byline(item)}
              </Text>
            </View>
          </NewsLink>
        )}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={PICK_WIDTH + 12}
      />
    </BandShell>
  );
}
