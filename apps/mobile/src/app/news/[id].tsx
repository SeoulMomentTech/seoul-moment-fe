import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { formatDate } from "@shared/lib/utils/formatDate";
import type { NewsDetailSection } from "@shared/services/news";
import { SectionError, SectionSkeleton } from "@shared/ui/section-state";

import { useNewsDetail } from "@features/news";

const BANNER_HEIGHT = 240;
const FULL_BLEED_HEIGHT = 200;
const CARD_WIDTH = 264;
const CARD_HEIGHT = 284;
const IMAGE_GAP = 12;
// 웹 모바일 구간 간격(50~90px)과 같은 결로 섹션 사이를 크게 띄운다.
const SECTION_GAP = 64;
// 제목/본문/이미지 블록 사이 간격.
const BLOCK_GAP = 24;
const CONTENT_LINE_HEIGHT = 26;
const SCRIM_HEIGHT = 120;
// 떠 있는 뒤로가기 버튼(top 8 + 지름 36) 아래로 상태 화면 내용을 내린다.
const BACK_BUTTON_CLEARANCE = 52;

function BackButton() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityLabel="Go back"
      accessibilityRole="button"
      className="absolute left-5 h-9 w-9 items-center justify-center rounded-full"
      hitSlop={8}
      onPress={() => router.back()}
      // 배너 사진 위에 떠야 하므로 반투명 검정을 직접 쓴다. 토큰에는 오버레이 색이 없다.
      style={{ top: insets.top + 8, backgroundColor: "rgba(0,0,0,0.45)" }}
    >
      {/* 어두운 원 위의 글리프라 토큰 대신 흰색을 직접 쓴다. */}
      <Text className="text-title-4 font-bold" style={{ color: "#FFFFFF" }}>
        ‹
      </Text>
    </Pressable>
  );
}

/**
 * 배너 상단 스크림. 밝은 사진 위에서도 뒤로가기 버튼과 상태바 글리프가 보이도록
 * 위에서 아래로 옅어지는 검정 그라디언트를 SVG 로 그린다.
 */
function TopScrim() {
  return (
    <Svg
      height={SCRIM_HEIGHT}
      pointerEvents="none"
      style={{ position: "absolute", top: 0, left: 0, right: 0 }}
      width="100%"
    >
      <Defs>
        <LinearGradient id="scrim" x1="0" x2="0" y1="0" y2="1">
          {/* className 을 받지 못하는 SVG 라 스톱 색을 직접 쓴다. */}
          <Stop offset="0" stopColor="#000000" stopOpacity={0.45} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect fill="url(#scrim)" height={SCRIM_HEIGHT} width="100%" x={0} y={0} />
    </Svg>
  );
}

/**
 * index % 4 로 고르는 섹션 리듬. 웹 모바일 구간과 같다.
 * 0: 가운데 정렬 제목 + 풀블리드 이미지(아래)
 * 1: 세로 카드 이미지(왼쪽 inset, 아래)
 * 2: 세로 카드 이미지(오른쪽 inset, 위)
 * 3: 풀블리드 이미지(위)
 */
const SECTION_VARIANTS = [
  { image: "bleed", imageFirst: false, centered: true },
  { image: "card-left", imageFirst: false, centered: false },
  { image: "card-right", imageFirst: true, centered: false },
  { image: "bleed", imageFirst: true, centered: false },
] as const;

type ImageLayout = (typeof SECTION_VARIANTS)[number]["image"];

function SectionImages({
  uris,
  layout,
}: {
  uris: string[];
  layout: ImageLayout;
}) {
  // 이미지가 없으면 빈 블록도, 빈 간격도 만들지 않는다.
  if (uris.length === 0) {
    return null;
  }

  const isBleed = layout === "bleed";
  const wrapperClass = isBleed
    ? ""
    : layout === "card-right"
      ? "items-end px-5"
      : "items-start px-5";

  return (
    <View className={wrapperClass} style={{ gap: IMAGE_GAP }}>
      {uris.map((uri, index) => (
        <Image
          contentFit="cover"
          // 정적 목록이라 순서가 바뀌지 않으므로 index 키가 안전하다.
          // eslint-disable-next-line react/no-array-index-key
          key={`${index}-${uri}`}
          source={uri}
          style={
            isBleed
              ? { width: "100%", height: FULL_BLEED_HEIGHT }
              : { width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 12 }
          }
          transition={200}
        />
      ))}
    </View>
  );
}

function ArticleSection({
  section,
  index,
}: {
  section: NewsDetailSection;
  index: number;
}) {
  const variant = SECTION_VARIANTS[index % SECTION_VARIANTS.length];
  const hasText = Boolean(section.title || section.subTitle || section.content);
  const headingAlign = variant.centered ? "text-center" : "text-left";

  // 텍스트 블록만 px-5 inset 을 가지므로 풀블리드 이미지는 화면 가장자리까지 닿는다.
  const text = hasText ? (
    <View className="px-5" style={{ gap: 12 }}>
      {section.title ? (
        <Text
          className={`text-title-4 text-foreground font-semibold ${headingAlign}`}
        >
          {section.title}
        </Text>
      ) : null}
      {section.subTitle ? (
        <Text
          className={`text-body-2 text-foreground font-semibold ${headingAlign}`}
        >
          {section.subTitle}
        </Text>
      ) : null}
      {section.content ? (
        <Text
          className="text-body-2 text-foreground text-left"
          style={{ lineHeight: CONTENT_LINE_HEIGHT }}
        >
          {section.content}
        </Text>
      ) : null}
    </View>
  ) : null;

  const images = (
    <SectionImages layout={variant.image} uris={section.imageList} />
  );

  return (
    <View style={{ marginTop: SECTION_GAP, gap: BLOCK_GAP }}>
      {variant.imageFirst ? images : text}
      {variant.imageFirst ? text : images}
    </View>
  );
}

export default function NewsDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
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
        <View style={{ paddingTop: insets.top + BACK_BUTTON_CLEARANCE }}>
          <SectionError onRetry={() => void refetch()} />
        </View>
      </View>
    );
  }

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다. 스켈레톤을 영원히
  // 돌리지 말고 재시도 줄을 보여준다.
  if (isPending && fetchStatus === "paused") {
    return (
      <View className="bg-background flex-1">
        <BackButton />
        <View style={{ paddingTop: insets.top + BACK_BUTTON_CLEARANCE }}>
          <SectionError onRetry={() => void refetch()} />
        </View>
      </View>
    );
  }

  if (isPending) {
    return (
      <View className="bg-background flex-1">
        <BackButton />
        <View style={{ paddingTop: insets.top + BACK_BUTTON_CLEARANCE }}>
          <SectionSkeleton height={BANNER_HEIGHT} />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="bg-background flex-1">
        <BackButton />
        <View style={{ paddingTop: insets.top + BACK_BUTTON_CLEARANCE }}>
          <SectionError onRetry={() => void refetch()} />
        </View>
      </View>
    );
  }

  const byline = [news.writer, formatDate(news.createDate)]
    .filter(Boolean)
    .join(" · ");

  return (
    <View className="bg-background flex-1">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: BANNER_HEIGHT + insets.top }}>
          <Image
            contentFit="cover"
            source={news.banner}
            style={{ width: "100%", height: "100%" }}
            transition={200}
          />
          <TopScrim />
        </View>
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
            index={index}
            // 정적 목록이라 순서가 바뀌지 않으므로 index 키가 안전하다.
            // eslint-disable-next-line react/no-array-index-key
            key={`${index}-${section.title}`}
            section={section}
          />
        ))}
      </ScrollView>
      <BackButton />
    </View>
  );
}
