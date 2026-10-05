import { View, useWindowDimensions, type DimensionValue } from "react-native";

import { Shimmer } from "./Shimmer";

// 텍스트 줄 높이. 토큰에 line-height 가 없어 플랫폼 기본값(글자 크기 x 약 1.2)을 반올림한 값이다.
// 막대(bar)는 줄 상자(line) 안에 세로 가운데로 놓아 실제 텍스트 줄과 같은 높이를 차지한다.
export const LINE_BODY_3 = 17;
export const LINE_BODY_2 = 19;
export const LINE_BODY_1 = 22;
export const LINE_TITLE_4 = 24;
const BAR_BODY_3 = 11;
const BAR_BODY_2 = 13;
const BAR_BODY_1 = 14;
const BAR_TITLE_4 = 16;

const PAGE_PADDING = 20;
const GRID_GAP = 12;
const IMAGE_RADIUS = 8;
const CARD_RADIUS = 12;

interface LineProps {
  line: number;
  bar: number;
  width?: DimensionValue;
}

function Line({ line, bar, width = "100%" }: LineProps) {
  return (
    <View style={{ height: line, justifyContent: "center" }}>
      <Shimmer height={bar} radius={4} width={width} />
    </View>
  );
}

/** 마지막 줄만 짧게 해서 문단처럼 보이게 한다. */
function lineWidth(index: number, count: number): DimensionValue {
  return index === count - 1 && count > 1 ? "60%" : "100%";
}

// ProductCard: 정사각 이미지 + 브랜드(mt-2) + 이름 2줄 + 가격(mt-1)
const CARD_TEXT_HEIGHT = 8 + LINE_BODY_3 + 2 * LINE_BODY_3 + 4 + LINE_BODY_3;

/** 카드 높이 = cellWidth + 80 (8 + 17 + 34 + 4 + 17). */
export function productCardHeight(cellWidth: number) {
  return cellWidth + CARD_TEXT_HEIGHT;
}

interface ProductCardSkeletonProps {
  /** 생략하면 부모 폭을 채운다(ProductCard 의 w-full 과 같다). */
  width?: DimensionValue;
}

export function ProductCardSkeleton({
  width = "100%",
}: ProductCardSkeletonProps) {
  return (
    <View style={{ width }}>
      <Shimmer aspectRatio={1} radius={IMAGE_RADIUS} />
      <View style={{ marginTop: 8 }}>
        <Line bar={BAR_BODY_3} line={LINE_BODY_3} width="40%" />
      </View>
      <Line bar={BAR_BODY_3} line={LINE_BODY_3} />
      <Line bar={BAR_BODY_3} line={LINE_BODY_3} width="70%" />
      <View style={{ marginTop: 4 }}>
        <Line bar={BAR_BODY_3} line={LINE_BODY_3} width="35%" />
      </View>
    </View>
  );
}

interface ProductGridSkeletonProps {
  /** 카드 개수. 기본 4(2x2). */
  count?: number;
  /**
   * home: NowOnSaleSection 처럼 셀 폭 47%, 행 간격 12.
   * shop: shop.tsx 의 CELL_WIDTH 와 같은 폭, 행 간격 24(Spacing.four).
   */
  variant?: "home" | "shop";
}

/** 2열 그리드 스켈레톤. 높이 = 행 수 x 카드 높이 + (행 수 - 1) x 행 간격. */
export function ProductGridSkeleton({
  count = 4,
  variant = "home",
}: ProductGridSkeletonProps) {
  const { width: screen } = useWindowDimensions();
  const inner = screen - PAGE_PADDING * 2;
  const cell =
    variant === "home" ? inner * 0.47 : Math.floor((inner - GRID_GAP) / 2);
  const rowGap = variant === "home" ? GRID_GAP : 24;

  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: PAGE_PADDING,
        columnGap: GRID_GAP,
        rowGap,
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        // 정적 개수라 index 키가 안전하다.

        <ProductCardSkeleton key={i} width={cell} />
      ))}
    </View>
  );
}

// PostRow: py-3 + 88x72 썸네일, 텍스트는 제목 2줄 + mt-1 + 메타 1줄(55)이라 썸네일(72)이 행 높이를 정한다.
const POST_THUMB_HEIGHT = 72;
export const POST_ROW_HEIGHT = POST_THUMB_HEIGHT + 24;

export function PostRowSkeleton() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: PAGE_PADDING,
        paddingVertical: 12,
      }}
    >
      <Shimmer height={POST_THUMB_HEIGHT} radius={IMAGE_RADIUS} width={88} />
      <View style={{ flex: 1 }}>
        <Line bar={BAR_BODY_3} line={LINE_BODY_3} />
        <Line bar={BAR_BODY_3} line={LINE_BODY_3} width="75%" />
        <View style={{ marginTop: 4 }}>
          <Line bar={BAR_BODY_3} line={LINE_BODY_3} width="45%" />
        </View>
      </View>
    </View>
  );
}

interface PostListSkeletonProps {
  /** 행 수. 기본 3. 높이 = count x 96. */
  count?: number;
}

export function PostListSkeleton({ count = 3 }: PostListSkeletonProps) {
  return (
    <View>
      {Array.from({ length: count }, (_, i) => (
        <PostRowSkeleton key={i} />
      ))}
    </View>
  );
}

interface BannerSkeletonProps {
  height?: number;
  /** true 면 좌우 20 여백 + 둥근 모서리(카드형), false 면 풀블리드. */
  inset?: boolean;
}

/** 높이 = height(기본 200). HeroBanner 는 220, Shop 배너는 200. */
export function BannerSkeleton({
  height = 200,
  inset = false,
}: BannerSkeletonProps) {
  return (
    <View style={{ paddingHorizontal: inset ? PAGE_PADDING : 0 }}>
      <Shimmer height={height} radius={inset ? CARD_RADIUS : 0} />
    </View>
  );
}

interface HeroCardSkeletonProps {
  /** 이미지 높이. 실제 PromotionHero 의 HERO_HEIGHT 를 그대로 넘긴다. */
  imageHeight: number;
}

/**
 * PromotionHero 스켈레톤(프로모션이 1개일 때의 단일 풀폭 카드). 좌우 20 여백 포함.
 * 높이 = imageHeight + 12 + 19 + 4 + 2x17 = imageHeight + 69 (200 이면 269).
 * 제목 body-2 1줄(mt-3), 설명 body-3 2줄(mt-1) 클램프와 같다.
 */
export function HeroCardSkeleton({ imageHeight }: HeroCardSkeletonProps) {
  return (
    <View style={{ paddingHorizontal: PAGE_PADDING }}>
      <Shimmer height={imageHeight} radius={CARD_RADIUS} />
      <View style={{ marginTop: 12 }}>
        <Line bar={BAR_BODY_2} line={LINE_BODY_2} width="60%" />
      </View>
      <View style={{ marginTop: 4 }}>
        <Line bar={BAR_BODY_3} line={LINE_BODY_3} />
        <Line bar={BAR_BODY_3} line={LINE_BODY_3} width="70%" />
      </View>
    </View>
  );
}

// FeaturedSection 카테고리 알약: py-1 + body-3 한 줄 = 4 + 17 + 4, 아래 mb-2.
const PILL_HEIGHT = LINE_BODY_3 + 8;

/**
 * 뉴스 Featured 스켈레톤. 좌우 20 여백 포함.
 * 높이 = imageHeight + 12 + (25 + 8) + 2x22 + 4 + 17 = imageHeight + 110 (220 이면 330).
 * 알약(mt-3 블록 안), 제목 body-1 2줄, 바이라인 body-3 1줄(mt-1) 클램프와 같다.
 */
export function FeaturedSkeleton({ imageHeight }: HeroCardSkeletonProps) {
  return (
    <View style={{ paddingHorizontal: PAGE_PADDING }}>
      <Shimmer height={imageHeight} radius={CARD_RADIUS} />
      <View style={{ marginTop: 12 }}>
        <View style={{ marginBottom: 8 }}>
          <Shimmer height={PILL_HEIGHT} radius={PILL_HEIGHT / 2} width={72} />
        </View>
        <Line bar={BAR_BODY_1} line={LINE_BODY_1} />
        <Line bar={BAR_BODY_1} line={LINE_BODY_1} width="60%" />
        <View style={{ marginTop: 4 }}>
          <Line bar={BAR_BODY_3} line={LINE_BODY_3} width="45%" />
        </View>
      </View>
    </View>
  );
}

interface HorizontalCardsSkeletonProps {
  count?: number;
  /** 기본: 화면 폭의 72%(Editor's Pick / Hot Keyword 의 PICK_WIDTH). */
  cardWidth?: number;
  /** 기본 160(PICK_HEIGHT). 관련 글 캐러셀은 140. */
  imageHeight?: number;
  /**
   * pick: 이미지 + 제목 2줄(body-3, mt-2) + 메타 1줄(mt-1).
   * related: 이미지 + 제목 2줄(body-2, mt-3). RelatedPosts 와 같다.
   */
  variant?: "pick" | "related";
}

/**
 * 가로 캐러셀 스켈레톤. 한 화면에 걸리는 만큼만 그린다(스크롤하지 않는다).
 * 높이 pick = imageHeight + 8 + 34 + 4 + 17 = imageHeight + 63 (기본 223).
 * 높이 related = imageHeight + 12 + 38 = imageHeight + 50 (기본 190).
 */
export function HorizontalCardsSkeleton({
  count = 3,
  cardWidth,
  imageHeight,
  variant = "pick",
}: HorizontalCardsSkeletonProps) {
  const { width: screen } = useWindowDimensions();
  const width = cardWidth ?? Math.round(screen * 0.72);
  const image = imageHeight ?? 160;

  return (
    <View
      style={{
        flexDirection: "row",
        gap: GRID_GAP,
        paddingHorizontal: PAGE_PADDING,
        overflow: "hidden",
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={{ width }}>
          <Shimmer height={image} radius={CARD_RADIUS} />
          {variant === "pick" ? (
            <>
              <View style={{ marginTop: 8 }}>
                <Line bar={BAR_BODY_3} line={LINE_BODY_3} />
              </View>
              <Line bar={BAR_BODY_3} line={LINE_BODY_3} width="70%" />
              <View style={{ marginTop: 4 }}>
                <Line bar={BAR_BODY_3} line={LINE_BODY_3} width="40%" />
              </View>
            </>
          ) : (
            <>
              <View style={{ marginTop: 12 }}>
                <Line bar={BAR_BODY_2} line={LINE_BODY_2} />
              </View>
              <Line bar={BAR_BODY_2} line={LINE_BODY_2} width="65%" />
            </>
          )}
        </View>
      ))}
    </View>
  );
}

// Chip: px-4 py-2 + body-3 한 줄 + 테두리 1 x 2 = 17 + 16 + 2
export const CHIP_HEIGHT = LINE_BODY_3 + 16 + 2;
const CHIP_WIDTHS = [72, 96, 80];
const CHIP_GAP = 8;

interface ChipRowsSkeletonProps {
  /** 줄 수. 기본 2. */
  rows?: number;
}

/**
 * 필터 시트 칩 영역. flex-wrap 은 화면 폭에 따라 줄 수가 달라져 높이를 못 박을 수 없어서,
 * 줄마다 칩 3개(72+96+80+16 = 264 < 280)를 고정으로 둔다. 320pt 화면에서도 넘치지 않는다.
 * 높이 = rows x 35 + (rows - 1) x 8.
 */
export function ChipRowsSkeleton({ rows = 2 }: ChipRowsSkeletonProps) {
  return (
    <View style={{ gap: CHIP_GAP, paddingHorizontal: PAGE_PADDING }}>
      {Array.from({ length: rows }, (_, r) => (
        <View key={r} style={{ flexDirection: "row", gap: CHIP_GAP }}>
          {CHIP_WIDTHS.map((w) => (
            <Shimmer
              height={CHIP_HEIGHT}
              key={w}
              radius={CHIP_HEIGHT / 2}
              width={w}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

// All + 최상위 카테고리 3개(Fashion / Cosmetic / Accessory)의 칩 폭. 글자 길이에서 눈대중한 값이다.
const CATEGORY_CHIP_WIDTHS = [56, 88, 100, 108];

/**
 * 상품 목록 카테고리 칩 한 줄. 높이 = CHIP_HEIGHT(35).
 * 실제 스크롤러의 marginTop 20 은 호출부가 준다.
 */
export function CategoryChipsSkeleton() {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: CHIP_GAP,
        paddingHorizontal: PAGE_PADDING,
        overflow: "hidden",
      }}
    >
      {CATEGORY_CHIP_WIDTHS.map((w) => (
        <Shimmer
          height={CHIP_HEIGHT}
          key={w}
          radius={CHIP_HEIGHT / 2}
          width={w}
        />
      ))}
    </View>
  );
}

interface BrandHeaderSkeletonProps {
  /** 실제 배너와 같은 높이. 풀블리드라 좌우 여백이 없다. */
  bannerHeight: number;
  /** 설명 줄 수. 기본 6 — dev 의 소개글 173~197자가 390pt 에서 차지하는 줄 수다. */
  lines?: number;
}

/**
 * 브랜드 헤더(배너 + 이름 + 소개). 높이 = bannerHeight + 20 + 24 + 12 + lines x 17.
 * 소개 길이는 브랜드마다 달라 줄 수까지 맞출 수는 없고, 흔한 길이에 맞춘다.
 */
export function BrandHeaderSkeleton({
  bannerHeight,
  lines = 6,
}: BrandHeaderSkeletonProps) {
  return (
    <View>
      <Shimmer height={bannerHeight} radius={0} />
      <View style={{ paddingHorizontal: PAGE_PADDING, paddingTop: 20 }}>
        <Line bar={BAR_TITLE_4} line={LINE_TITLE_4} width="45%" />
        <View style={{ marginTop: 12 }}>
          {Array.from({ length: lines }, (_, i) => (
            <Line
              bar={BAR_BODY_3}
              key={i}
              line={LINE_BODY_3}
              // 마지막 줄만 짧게 끊어 문단처럼 보이게 한다.
              width={i === lines - 1 ? "55%" : undefined}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

interface DetailSkeletonProps {
  /**
   * article: 배너 + 바이라인 + 리드 3줄 + 제목 2줄 + 본문 4줄 (DetailScreen).
   * product: 갤러리 + 브랜드 + 이름 2줄 + 가격 + 스펙 3줄 (ProductDetailScreen).
   */
  variant?: "article" | "product";
  /** 기본 article 220, product 300. 실제 배너는 상태바 밑까지 풀블리드라 호출부가 insets.top 을 더해 넘기고, StatusScreen 대신 패딩 없는 틀에 놓는다. */
  bannerHeight?: number;
}

const ARTICLE_LEAD_LINE = 28;
const ARTICLE_BODY_LINE = 26;
const ARTICLE_TITLE_LINE = 28;

/**
 * 상세 화면 로딩 상태. 높이(배너 B 별):
 * article = B + 24 + 24 + 16 + 3x28 + 32 + 2x28 + 12 + 4x26 = B + 352 (기본 572).
 * product = B + 20 + 24 + 12 + 2x24 + 16 + 28 + 24 + 20 + 3x17 + 2x12 = B + 267 (기본 567).
 */
export function DetailSkeleton({
  variant = "article",
  bannerHeight,
}: DetailSkeletonProps) {
  if (variant === "product") {
    return (
      <View>
        <Shimmer height={bannerHeight ?? 300} radius={0} />
        <View style={{ paddingHorizontal: PAGE_PADDING, paddingTop: 20 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              height: 24,
            }}
          >
            <Shimmer height={24} radius={12} width={24} />
            <Shimmer height={BAR_BODY_3} radius={4} width={96} />
          </View>
          <View style={{ marginTop: 12 }}>
            <Line bar={BAR_TITLE_4} line={LINE_TITLE_4} />
            <Line bar={BAR_TITLE_4} line={LINE_TITLE_4} width="55%" />
          </View>
          <View style={{ marginTop: 16 }}>
            <Shimmer height={28} radius={4} width={140} />
          </View>
          <View style={{ marginTop: 24, paddingTop: 20, gap: 12 }}>
            {[0, 1, 2].map((i) => (
              <Line bar={BAR_BODY_3} key={i} line={LINE_BODY_3} />
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View>
      <Shimmer height={bannerHeight ?? 220} radius={0} />
      <View style={{ paddingHorizontal: PAGE_PADDING, paddingTop: 24 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            height: 24,
          }}
        >
          <Shimmer height={24} radius={12} width={24} />
          <Shimmer height={BAR_BODY_3} radius={4} width={140} />
        </View>
        <View style={{ marginTop: 16 }}>
          {[0, 1, 2].map((i) => (
            <Line
              bar={14}
              key={i}
              line={ARTICLE_LEAD_LINE}
              width={lineWidth(i, 3)}
            />
          ))}
        </View>
      </View>
      <View style={{ paddingHorizontal: PAGE_PADDING, paddingTop: 32 }}>
        <Line bar={BAR_TITLE_4} line={ARTICLE_TITLE_LINE} />
        <Line bar={BAR_TITLE_4} line={ARTICLE_TITLE_LINE} width="50%" />
        <View style={{ marginTop: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <Line
              bar={BAR_BODY_2}
              key={i}
              line={ARTICLE_BODY_LINE}
              width={lineWidth(i, 4)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
