import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Dimensions, FlatList, Pressable, Text, View } from "react-native";

import { PostRow } from "@entities/post/ui/PostRow";
import { formatDate } from "@shared/lib/utils/formatDate";
import type { NewsWithCategory } from "@shared/services/news";
import { Section } from "@shared/ui/section";
import { SectionError } from "@shared/ui/section-state";
import {
  FeaturedSkeleton,
  HorizontalCardsSkeleton,
  PostListSkeleton,
  Shimmer,
} from "@shared/ui/skeleton";
// 줄 상자 높이는 스켈레톤 모듈이 기준값을 갖고 있다. 배럴에는 없어서 모듈에서 바로 가져온다.
import { LINE_BODY_3, LINE_TITLE_3 } from "@shared/ui/skeleton/shapes";

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
        <FeaturedSkeleton imageHeight={FEATURED_HEIGHT} />
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

// 웹의 Hot Keyword 띠는 어두운 배경이다. --foreground(#171717) 가 그 색이라 bg-foreground,
// 글씨는 --neutral-0 인 text-background 를 쓴다.
//
// 제목 블록을 BandShell 이 들고 있는 이유: 예전에는 실제 갈래에만 제목이 있어서
// 스켈레톤이 66pt(17 + 4 + 29 + 16) 짧았다. 두 갈래가 같은 틀을 지나게 해 다시 어긋나지 않게 한다.
function BandShell({
  children,
  heading,
}: {
  children: React.ReactNode;
  heading?: React.ReactNode;
}) {
  return (
    <View className="bg-foreground mt-10 py-8">
      {heading ? <View className="mb-4 px-5">{heading}</View> : null}
      {children}
    </View>
  );
}

// 제목 블록 자리맞춤. 막대는 글자 크기의 약 0.8 로, 다른 스켈레톤 막대와 같은 비율이다.
const BAND_LABEL_BAR = 11;
const BAND_NAME_BAR = 19;

function BandHeadingSkeleton() {
  return (
    <>
      <View style={{ height: LINE_BODY_3, justifyContent: "center" }}>
        <Shimmer height={BAND_LABEL_BAR} radius={4} width={96} />
      </View>
      <View
        style={{
          height: LINE_TITLE_3,
          marginTop: 4,
          justifyContent: "center",
        }}
      >
        <Shimmer height={BAND_NAME_BAR} radius={4} width={140} />
      </View>
    </>
  );
}

// SectionError 는 흰 배경 기준이라 어두운 띠에서는 대비가 낮다. 띠 전용 행을 쓴다.
function BandError({ onRetry }: { onRetry(): void }) {
  return (
    <View className="border-background mx-5 flex-row items-center justify-between rounded-lg border px-4 py-3">
      <Text className="text-body-3 text-background">
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
      <BandShell heading={<BandHeadingSkeleton />}>
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
    <BandShell
      heading={
        <>
          <Text
            className="text-body-3 text-background font-bold"
            numberOfLines={1}
            style={{ opacity: 0.7 }}
          >
            Hot Keyword
          </Text>
          <Text
            className="text-title-3 text-background mt-1 font-bold"
            numberOfLines={1}
          >
            {`#${hashtag.name}`}
          </Text>
        </>
      }
    >
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
                className="text-body-3 text-background mt-2 font-bold"
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <Text
                className="text-body-3 text-background mt-1"
                numberOfLines={1}
                style={{ opacity: 0.7 }}
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
