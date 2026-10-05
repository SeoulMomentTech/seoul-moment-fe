import type { ReactNode } from "react";

import { Image } from "expo-image";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { formatDate } from "@shared/lib/utils/formatDate";
import type { NewsDetailSection, NewsLastItem } from "@shared/services/news";
import { SectionError, SectionSkeleton } from "@shared/ui/section-state";

import { RelatedPosts } from "./RelatedPosts";

const BANNER_HEIGHT = 300;
// 상태 화면 스켈레톤 높이. 배너보다 낮게 유지한다.
const SKELETON_HEIGHT = 240;
const SECTION_IMAGE_HEIGHT = 220;
// 제목 두 줄 + 카테고리가 들어가는 하단 스크림 높이. 위쪽 스크림(insets.top + 64)과의 사이에
// BANNER_HEIGHT - 64 - 210 = 26px 의 무보정 구간이 insets 와 무관하게 남는 크기.
const BOTTOM_SCRIM_HEIGHT = 210;
// 사진 위 흰 글씨 보강용 부드러운 그림자. 외곽선처럼 보이지 않게 반경을 작게 둔다.
const OVERLAY_TEXT_SHADOW = {
  textShadowColor: "rgba(0,0,0,0.45)",
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 4,
} as const;
const IMAGE_GAP = 12;
// 웹 모바일 구간 간격(50~90px)과 같은 결로 섹션 사이를 크게 띄운다.
const SECTION_GAP = 64;
// 제목/본문/이미지 블록 사이 간격.
const BLOCK_GAP = 24;
const CONTENT_LINE_HEIGHT = 26;
const LEAD_LINE_HEIGHT = 28;
const AVATAR_SIZE = 24;
// 스크림은 상태바 영역(insets.top) 아래로 이만큼 더 내려와 옅어진다.
const SCRIM_EXTRA_HEIGHT = 64;
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
 * 화면 상단에 고정되는 스크림. 밝은 사진 위에서도 상태바 글리프와 뒤로가기 버튼이
 * 보이도록 위에서 아래로 옅어지는 검정 그라디언트를 SVG 로 그린다.
 */
function TopScrim({ height }: { height: number }) {
  return (
    <Svg
      height={height}
      pointerEvents="none"
      style={{ position: "absolute", top: 0, left: 0, right: 0 }}
      width="100%"
    >
      <Defs>
        <LinearGradient id="scrim" x1="0" x2="0" y1="0" y2="1">
          {/* className 을 받지 못하는 SVG 라 스톱 색을 직접 쓴다. 맨 위 0.5 는 밝은 사진에서도 글리프가 읽히는 값. */}
          <Stop offset="0" stopColor="#000000" stopOpacity={0.5} />
          {/* 중간 스톱으로 띠 경계가 도드라지지 않게 부드럽게 줄인다. */}
          <Stop offset="0.5" stopColor="#000000" stopOpacity={0.2} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect fill="url(#scrim)" height={height} width="100%" x={0} y={0} />
    </Svg>
  );
}

/**
 * 콘텐츠가 없는 상태(잘못된 id, 오프라인, 로딩, 에러) 공통 틀.
 * 흰 배경이라 스크림 없이 어두운 상태바 글리프를 쓰고, 뒤로가기 버튼은 항상 둔다.
 */
function StatusScreen({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-background flex-1">
      <StatusBar style="dark" />
      <BackButton />
      <View style={{ paddingTop: insets.top + BACK_BUTTON_CLEARANCE }}>
        {children}
      </View>
    </View>
  );
}

function SectionImages({ uris }: { uris: string[] }) {
  // 이미지가 없으면 빈 블록도, 빈 간격도 만들지 않는다.
  if (uris.length === 0) {
    return null;
  }

  return (
    <View className="px-5" style={{ gap: IMAGE_GAP }}>
      {uris.map((uri, index) => (
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
          }}
          transition={200}
        />
      ))}
    </View>
  );
}

/** 모든 섹션이 같은 모양이다: 제목 → 소제목 → 본문 → 이미지, 모두 좌측 정렬. */
function ArticleSection({ section }: { section: NewsDetailSection }) {
  const hasText = Boolean(section.title || section.subTitle || section.content);

  return (
    <View style={{ marginTop: SECTION_GAP, gap: BLOCK_GAP }}>
      {hasText ? (
        <View className="px-5" style={{ gap: 12 }}>
          {section.title ? (
            <Text className="text-title-4 text-foreground text-left font-semibold">
              {section.title}
            </Text>
          ) : null}
          {section.subTitle ? (
            <Text className="text-body-2 text-foreground text-left font-semibold">
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
      ) : null}
      <SectionImages uris={section.imageList} />
    </View>
  );
}

/**
 * 배너 아래쪽에 깔리는 스크림. 제목이 밝은 사진 위에서도 읽히도록 투명에서 어두운 쪽으로 진해진다.
 * 위쪽 TopScrim 과 영역이 겹치지 않도록 높이를 제한한다.
 */
function BottomScrim({ height }: { height: number }) {
  return (
    <Svg
      height={height}
      pointerEvents="none"
      style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
      width="100%"
    >
      <Defs>
        <LinearGradient id="bottomScrim" x1="0" x2="0" y1="0" y2="1">
          {/* className 을 받지 못하는 SVG 라 스톱 색을 직접 쓴다. 위는 완전 투명이라 사진 중간에 경계가 생기지 않고, 글씨가 놓이는 구간은 0.6 이상, 바닥은 거의 불투명한 0.92. */}
          <Stop offset="0" stopColor="#000000" stopOpacity={0} />
          <Stop offset="0.3" stopColor="#000000" stopOpacity={0.35} />
          <Stop offset="0.6" stopColor="#000000" stopOpacity={0.78} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0.92} />
        </LinearGradient>
      </Defs>
      <Rect fill="url(#bottomScrim)" height={height} width="100%" x={0} y={0} />
    </Svg>
  );
}

/** 뉴스/아티클 상세가 공유하는 응답 모양. 두 응답은 관련 글 배열 이름만 다르다. */
export interface DetailContent {
  writer: string;
  createDate: string;
  category: string;
  title: string;
  content: string;
  banner: string;
  profileImage: string;
  section: NewsDetailSection[];
}

interface DetailQuery<T extends DetailContent> {
  data: T | undefined;
  isPending: boolean;
  isError: boolean;
  fetchStatus: "fetching" | "paused" | "idle";
  refetch(): unknown;
}

interface DetailScreenProps<T extends DetailContent> {
  /** 라우트 파라미터를 Number 로 바꾼 값. NaN 이면 에러 화면을 보여준다. */
  id: number;
  query: DetailQuery<T>;
  getRelatedItems(detail: T): NewsLastItem[] | undefined;
  /** 관련 카드가 이동할 라우트 기준. */
  relatedRoute: "/news" | "/article";
  relatedHeading: string;
  /** 생략하면 관련 글 제목 줄에 더보기 컨트롤을 그리지 않는다. */
  relatedViewAllHref?: Href;
}

/**
 * 뉴스/아티클 상세 공용 화면. 상태 분기(잘못된 id → 오프라인 → 로딩 → 에러 → 콘텐츠)와
 * 모든 분기의 뒤로가기 버튼을 한곳에 둬서 라우트마다 어긋나지 않게 한다.
 */
export function DetailScreen<T extends DetailContent>({
  id,
  query,
  getRelatedItems,
  relatedRoute,
  relatedHeading,
  relatedViewAllHref,
}: DetailScreenProps<T>) {
  const insets = useSafeAreaInsets();
  const isValidId = Number.isFinite(id);
  const { data: detail, isPending, isError, fetchStatus, refetch } = query;

  // 잘못된 id 는 쿼리가 enabled=false 로 idle 에 머문다. 스켈레톤 대신 에러를 보여준다.
  if (!isValidId) {
    return (
      <StatusScreen>
        <SectionError onRetry={() => void refetch()} />
      </StatusScreen>
    );
  }

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다. 스켈레톤을 영원히
  // 돌리지 말고 재시도 줄을 보여준다.
  if (isPending && fetchStatus === "paused") {
    return (
      <StatusScreen>
        <SectionError onRetry={() => void refetch()} />
      </StatusScreen>
    );
  }

  if (isPending) {
    return (
      <StatusScreen>
        <SectionSkeleton height={SKELETON_HEIGHT} />
      </StatusScreen>
    );
  }

  if (isError || !detail) {
    return (
      <StatusScreen>
        <SectionError onRetry={() => void refetch()} />
      </StatusScreen>
    );
  }

  const relatedItems = getRelatedItems(detail);

  const byline = [detail.writer, formatDate(detail.createDate)]
    .filter(Boolean)
    .join(" · ");

  return (
    <View className="bg-background flex-1">
      {/* 스크림이 고정이라 스크롤 위치와 상관없이 글리프가 항상 어두운 띠 위에 놓이므로 light 가 안전하다. */}
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          className="overflow-hidden"
          style={{ height: BANNER_HEIGHT + insets.top }}
        >
          <Image
            contentFit="cover"
            source={detail.banner}
            style={{ width: "100%", height: "100%" }}
            transition={200}
          />
          <BottomScrim height={BOTTOM_SCRIM_HEIGHT} />
          <View className="absolute bottom-0 left-0 right-0 px-5 pb-6">
            {detail.category ? (
              <Text
                className="text-body-3 font-semibold uppercase"
                // 사진 위 오버레이라 토큰 대신 흰색을 직접 쓴다.
                style={{
                  color: "#FFFFFF",
                  letterSpacing: 1.2,
                  ...OVERLAY_TEXT_SHADOW,
                }}
              >
                {detail.category}
              </Text>
            ) : null}
            <Text
              className="text-title-3 mt-2 font-bold"
              numberOfLines={2}
              // 사진 위 오버레이라 토큰 대신 흰색을 직접 쓴다.
              style={{ color: "#FFFFFF", ...OVERLAY_TEXT_SHADOW }}
            >
              {detail.title}
            </Text>
          </View>
        </View>
        <View className="px-5 pt-6">
          {byline ? (
            <View className="flex-row items-center">
              {/* profileImage 가 빈 문자열이면 빈 원 대신 아바타를 생략한다. */}
              {detail.profileImage ? (
                <Image
                  contentFit="cover"
                  source={detail.profileImage}
                  style={{
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    borderRadius: AVATAR_SIZE / 2,
                    marginRight: 8,
                  }}
                />
              ) : null}
              <Text className="text-body-3 text-neutral">{byline}</Text>
            </View>
          ) : null}
          <Text
            className="text-body-1 text-foreground mt-4"
            style={{ lineHeight: LEAD_LINE_HEIGHT }}
          >
            {detail.content}
          </Text>
        </View>
        {detail.section.map((section, index) => (
          <ArticleSection
            // 정적 목록이라 순서가 바뀌지 않으므로 index 키가 안전하다.
            // eslint-disable-next-line react/no-array-index-key
            key={`${index}-${section.title}`}
            section={section}
          />
        ))}
        <RelatedPosts
          heading={relatedHeading}
          items={relatedItems}
          routeBase={relatedRoute}
          viewAllHref={relatedViewAllHref}
        />
      </ScrollView>
      {/* 스크롤 콘텐츠 위, 뒤로가기 버튼 아래. JSX 순서로 쌓임이 정해진다. */}
      <TopScrim height={insets.top + SCRIM_EXTRA_HEIGHT} />
      <BackButton />
    </View>
  );
}
