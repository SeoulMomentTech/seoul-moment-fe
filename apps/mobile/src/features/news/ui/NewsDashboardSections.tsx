import { Image } from "expo-image";
import { Dimensions, FlatList, Text, View } from "react-native";

import { PostRow } from "@entities/post/ui/PostRow";
import type { NewsWithCategory } from "@shared/services/news";
import { Section } from "@shared/ui/section";
import { SectionError, SectionSkeleton } from "@shared/ui/section-state";

import { useNewsDashboard } from "../model/useNewsDashboard";

const FEATURED_HEIGHT = 220;
const LATEST_HEIGHT = 290;
const PICK_WIDTH = Math.round(Dimensions.get("window").width * 0.72);
const PICK_HEIGHT = 160;
const PICK_LIST_HEIGHT = 240;
const KEYWORD_LIST_HEIGHT = 240;

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
};

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
        <SectionSkeleton height={FEATURED_HEIGHT} />
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
        <SectionSkeleton height={LATEST_HEIGHT} />
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
          <PostRow
            createDate={item.createDate}
            imageUrl={item.homeImage}
            key={item.id}
            title={item.title}
            writer={item.writer}
          />
        ))}
      </View>
    </Section>
  );
}

function PickCard({ item }: { item: NewsWithCategory }) {
  return (
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
        <SectionSkeleton height={PICK_LIST_HEIGHT} />
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

function BandMessage({ children }: { children: React.ReactNode }) {
  return <View className="px-5">{children}</View>;
}

function HotKeywordSection() {
  const { data, isPending, isError, fetchStatus, refetch } = useNewsDashboard();

  if (isPending && fetchStatus === "paused") {
    return (
      <BandShell>
        <BandMessage>
          <SectionError onRetry={() => void refetch()} />
        </BandMessage>
      </BandShell>
    );
  }

  if (isPending) {
    return (
      <BandShell>
        <SectionSkeleton height={KEYWORD_LIST_HEIGHT} />
      </BandShell>
    );
  }

  if (isError) {
    return (
      <BandShell>
        <BandMessage>
          <SectionError onRetry={() => void refetch()} />
        </BandMessage>
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
        )}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={PICK_WIDTH + 12}
      />
    </BandShell>
  );
}
