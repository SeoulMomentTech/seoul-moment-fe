import { View, type DimensionValue } from "react-native";

import { CAROUSEL_CARD_WIDTH } from "@entities/product/ui/ProductCarousel";
import { CHIP_GAP } from "@shared/ui/chip";
import {
  CHIP_HEIGHT,
  LINE_BODY_5,
  LINE_TITLE_3,
  LINE_TITLE_4,
  ProductRowSkeleton,
  Shimmer,
} from "@shared/ui/skeleton";
import { CAROUSEL_PAGER_BLOCK } from "@shared/ui/slide-pager/SlideCarousel";

import { Spacing } from "@/constants/theme";

import {
  DESCRIPTION_LINE_HEIGHT,
  DESCRIPTION_LINES,
  LOGO_HEIGHT,
  NOTICE_LINES,
} from "./BrandIntroduction";
import { LOOKBOOK_GAP } from "./BrandLookbook";
import { POPUP_IMAGE_HEIGHT, POPUP_INFO_HEIGHT } from "./BrandOfflinePopup";
import { SWITCHER_HEIGHT } from "./BrandSwitcher";
import { NOTICE_GAP, NOTICE_LINE_HEIGHT } from "./PromotionNotices";

const PAGE_PADDING = 20;
// 막대 두께. shapes.tsx 와 같은 값이다(줄 상자 안에 세로 가운데로 놓인다).
const BAR_BODY_5 = 10;
const BAR_BODY_3 = 11;
const BAR_TITLE_4 = 16;
const BAR_TITLE_3 = 19;
const SECTION_TOP = Spacing.section;
// Section 의 제목 줄 아래 여백(mb-4).
const TITLE_GAP = 16;
// 팝업 일정 알약. 개수는 응답에 달렸으므로 dev 와 같은 3개를 대표로 둔다.
const POPUP_TAB_COUNT = 3;
const POPUP_TAB_WIDTH = 100;

function Line({
  line,
  bar,
  width = "100%",
}: {
  line: number;
  bar: number;
  width?: DimensionValue;
}) {
  return (
    <View style={{ height: line, justifyContent: "center" }}>
      <Shimmer height={bar} radius={4} width={width} />
    </View>
  );
}

/** Section(title) 의 제목 줄 + 아래 여백. */
function SectionTitle({ width }: { width: DimensionValue }) {
  return (
    <View style={{ paddingHorizontal: PAGE_PADDING, marginBottom: TITLE_GAP }}>
      <Line bar={BAR_TITLE_4} line={LINE_TITLE_4} width={width} />
    </View>
  );
}

/**
 * 브랜드 소개 블록. 높이 =
 * 24 + 48 + 16 + 29 + 4 + 14 + 16 + 6x22 + 12 + 2x14 + 16 + 44 + 24 = **407**.
 */
function IntroSkeleton() {
  return (
    <View
      className="bg-surface-muted"
      style={{ paddingHorizontal: PAGE_PADDING, paddingVertical: 24 }}
    >
      <Shimmer height={LOGO_HEIGHT} width={140} />
      <View style={{ marginTop: 16 }}>
        <Line bar={BAR_TITLE_3} line={LINE_TITLE_3} width="50%" />
      </View>
      <View style={{ marginTop: 4 }}>
        <Line bar={BAR_BODY_5} line={LINE_BODY_5} width="25%" />
      </View>
      <View style={{ marginTop: 16 }}>
        {Array.from({ length: DESCRIPTION_LINES }, (_, i) => (
          <Line
            bar={BAR_BODY_3}
            key={i}
            line={DESCRIPTION_LINE_HEIGHT}
            width={i === DESCRIPTION_LINES - 1 ? "60%" : "100%"}
          />
        ))}
      </View>
      <View style={{ marginTop: Spacing.tight }}>
        {Array.from({ length: NOTICE_LINES }, (_, i) => (
          <Line
            bar={BAR_BODY_5}
            key={i}
            line={LINE_BODY_5}
            width={i === NOTICE_LINES - 1 ? "70%" : "100%"}
          />
        ))}
      </View>
      <View style={{ marginTop: 16 }}>
        <Shimmer height={44} radius={22} />
      </View>
    </View>
  );
}

/**
 * 룩북. 묶음 수와 종류는 응답을 받기 전에는 알 수 없어서, 웹 로딩 화면과 같이
 * TYPE_1 한 장 + TYPE_2 두 장을 대표로 둔다.
 * 높이 = 40 + 540 + 40 + 2x218 + 40 = **1096**.
 */
function LookbookSkeleton() {
  return (
    <View
      className="bg-surface-muted"
      style={{ paddingTop: SECTION_TOP, paddingBottom: SECTION_TOP }}
    >
      <View style={{ gap: LOOKBOOK_GAP }}>
        <Shimmer height={540} radius={0} />
        <View>
          <Shimmer height={218} radius={0} />
          <Shimmer height={218} radius={0} />
        </View>
      </View>
    </View>
  );
}

/** 상품 줄. 높이 = 40 + 24 + 16 + 233 = **313**. */
function ProductsSkeleton() {
  return (
    <View style={{ paddingTop: SECTION_TOP }}>
      <SectionTitle width="45%" />
      <ProductRowSkeleton cardWidth={CAROUSEL_CARD_WIDTH} />
    </View>
  );
}

/**
 * 팝업. 일정 알약과 슬라이드 장수는 응답에 달렸으므로 둘 다 있는 쪽(알약 한 줄, 여러 장)을 그린다.
 * 높이 = 40 + 24 + 16 + 35 + 12 + 230 + 73 + 24 + 274 = **728**.
 */
function PopupSkeleton() {
  return (
    <View style={{ paddingTop: SECTION_TOP }}>
      <SectionTitle width="70%" />
      <View
        style={{
          flexDirection: "row",
          gap: CHIP_GAP,
          paddingHorizontal: PAGE_PADDING,
          overflow: "hidden",
        }}
      >
        {/* 알약에 적히는 말은 날짜 하나뿐이라 폭이 모두 같다(2025.02.01 ≈ 100pt). */}
        {Array.from({ length: POPUP_TAB_COUNT }, (_, i) => (
          <Shimmer
            height={CHIP_HEIGHT}
            key={i}
            radius={CHIP_HEIGHT / 2}
            width={POPUP_TAB_WIDTH}
          />
        ))}
      </View>
      <View style={{ marginTop: Spacing.tight }}>
        <Shimmer height={POPUP_IMAGE_HEIGHT} radius={0} />
        <View style={{ height: CAROUSEL_PAGER_BLOCK }} />
      </View>
      {/* 안쪽 줄을 하나하나 그리지 않고 블록 하나로 둔다 — 실제와 같은 높이만 맡으면 된다. */}
      <View
        style={{ marginTop: Spacing.inner, paddingHorizontal: PAGE_PADDING }}
      >
        <Shimmer height={POPUP_INFO_HEIGHT} radius={8} />
      </View>
    </View>
  );
}

/**
 * 공지. 글 길이가 데이터마다 달라 한 줄이 두 줄이 되기도 한다 — 세 줄이 두 줄씩이라고 본다.
 * 페이지의 마지막 블록이라 이 추정이 어긋나도 위로 밀리는 것이 없다.
 * 높이 = 40 + 24 + 16 + 3x40 + 2x12 + 40 = **264**.
 */
function NoticeSkeleton() {
  return (
    <View
      className="bg-surface-muted"
      style={{ paddingTop: SECTION_TOP, paddingBottom: SECTION_TOP }}
    >
      <SectionTitle width="30%" />
      <View style={{ paddingHorizontal: PAGE_PADDING, gap: NOTICE_GAP }}>
        {[0, 1, 2].map((i) => (
          <View key={i}>
            <Line bar={BAR_BODY_3} line={NOTICE_LINE_HEIGHT} />
            <Line bar={BAR_BODY_3} line={NOTICE_LINE_HEIGHT} width="65%" />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * 배너 아래 본문 전체. 높이 = 407 + 1096 + 313 + 728 + 264 = **2808**.
 * 온라인 이벤트는 dev 응답에 하나도 없어 자리를 잡지 않는다 — 있는 줄 알고 자리를 비워 두면
 * 대부분의 경우에 빈 칸이 생긴다.
 */
export function PromotionBodySkeleton() {
  return (
    <View>
      <IntroSkeleton />
      <LookbookSkeleton />
      <ProductsSkeleton />
      <PopupSkeleton />
      <NoticeSkeleton />
    </View>
  );
}

/**
 * 브랜드 목록조차 오기 전의 화면 전체. 브랜드가 몇 개인지 모르는 채로 전환 줄 자리를 잡는다 —
 * 웹 로딩 화면도 탭을 그리고, dev 의 유일한 프로모션이 2개 브랜드다.
 * 브랜드가 하나뿐인 프로모션에서는 목록이 도착하는 순간 60pt 가 줄어든다. 알고 남겨 둔 간극이다.
 *
 * 높이 = bannerHeight + 60 + 2808.
 */
export function PromotionSkeleton({ bannerHeight }: { bannerHeight: number }) {
  return (
    <View>
      <Shimmer height={bannerHeight} radius={0} />
      <View style={{ height: SWITCHER_HEIGHT }} />
      <PromotionBodySkeleton />
    </View>
  );
}
