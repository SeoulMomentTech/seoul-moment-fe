import { useState } from "react";

import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { ScrollView, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProductGrid } from "@entities/product/ui/ProductGrid";
import {
  BackButton,
  SCRIM_EXTRA_HEIGHT,
  StatusScreen,
  TopScrim,
} from "@shared/ui/detail-chrome";
import { EMPTY_ICON_SIZE, InboxIcon } from "@shared/ui/icons";
import {
  EmptyState,
  ScreenError,
  SectionError,
} from "@shared/ui/section-state";

import { Spacing } from "@/constants/theme";

import { BrandFooterLinks } from "./BrandFooterLinks";
import { BrandIntroduction } from "./BrandIntroduction";
import { BrandLookbook } from "./BrandLookbook";
import { BrandOfflinePopup } from "./BrandOfflinePopup";
import { BrandOnlineEvent } from "./BrandOnlineEvent";
import { BrandSwitcher } from "./BrandSwitcher";
import { PromotionNotices } from "./PromotionNotices";
import { PromotionBodySkeleton, PromotionSkeleton } from "./PromotionSkeleton";
import {
  usePromotionBrands,
  usePromotionDetail,
} from "../model/usePromotionQueries";

/**
 * 모바일 배너 원본의 가로세로비(dev 의 mobileImageUrl 은 1080x1350 = 4:5).
 * 다른 상세 화면처럼 300pt 로 자르면 세로로 찍은 이 사진의 아래 40% 가 날아간다.
 * 웹도 이 자리만 656px 로 따로 키운다 — 프로모션 배너는 섬네일이 아니라 표지다.
 */
const BANNER_ASPECT = 5 / 4;
// 빈 화면 아이콘 색. SVG 는 className 을 못 받아 --neutral-600 값을 직접 쓴다.
const EMPTY_ICON_COLOR = "#707070";
/** en.json 의 promotion_special_event. 앞 공백만 떼고 쓴다. */
const PRODUCTS_HEADING = "Brand Products";

/**
 * 브랜드 프로모션 상세. 웹은 /promotion/[id] 와 /promotion/[id]/brand/[brandPromotionId]
 * 두 화면으로 나누고 앞쪽이 첫 브랜드로 리다이렉트하지만, 여기서는 한 화면이다 —
 * 탭을 누를 때마다 화면을 쌓으면 뒤로가기가 브랜드 전환 기록으로 채워진다.
 *
 * 쿼리는 순서가 있다. 브랜드 목록이 와야 그중 하나의 brandPromotionId 로 상세를 부를 수 있어서,
 * 상세 쿼리는 고른 id 가 생길 때까지 enabled=false 로 묶여 있다.
 */
export function PromotionScreen({ promotionId }: { promotionId: number }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  // 상태바 밑까지 풀블리드라 화면 폭이 그대로 사진의 폭이다.
  const bannerHeight = Math.round(width * BANNER_ASPECT);
  const [selectedId, setSelectedId] = useState<number>();
  const brandsQuery = usePromotionBrands(promotionId);
  const brands = brandsQuery.data?.list ?? [];
  // 고른 브랜드가 아직 없거나(첫 진입) 새 목록에 없으면 첫 브랜드로 떨어진다.
  const activeId = brands.some((brand) => brand.id === selectedId)
    ? selectedId
    : brands[0]?.id;
  const detailQuery = usePromotionDetail(activeId);

  // 잘못된 id 는 쿼리가 enabled=false 로 idle 에 머문다. 스켈레톤 대신 에러를 보여준다.
  if (!Number.isFinite(promotionId)) {
    return (
      <StatusScreen>
        <ScreenError onRetry={() => void brandsQuery.refetch()} />
      </StatusScreen>
    );
  }

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (brandsQuery.isPending && brandsQuery.fetchStatus === "paused") {
    return (
      <StatusScreen>
        <ScreenError offline onRetry={() => void brandsQuery.refetch()} />
      </StatusScreen>
    );
  }

  if (brandsQuery.isPending) {
    return (
      <View className="bg-background flex-1">
        <StatusBar style="dark" />
        <BackButton />
        {/* 실제 배너는 상태바 밑까지 풀블리드다. StatusScreen 의 상단 패딩을 쓰면
            배너가 그만큼 아래로 밀린다. */}
        <PromotionSkeleton
          bannerHeight={bannerHeight}
          bottomInset={insets.bottom}
        />
      </View>
    );
  }

  if (brandsQuery.isError) {
    return (
      <StatusScreen>
        <ScreenError onRetry={() => void brandsQuery.refetch()} />
      </StatusScreen>
    );
  }

  if (brands.length === 0) {
    return (
      <StatusScreen>
        <EmptyState
          hint="Check back soon."
          icon={<InboxIcon color={EMPTY_ICON_COLOR} size={EMPTY_ICON_SIZE} />}
          message="This promotion has no brands yet"
        />
      </StatusScreen>
    );
  }

  const detail = detailQuery.data;
  const banner = detail?.bannerList?.[0];
  const bannerUri = banner?.mobileImageUrl || banner?.imageUrl;

  /**
   * 배너 아래 본문. 상세가 실패해도 배너·전환 줄·뒤로가기는 그대로 둔다 —
   * 브랜드를 하나 못 불러왔다고 다른 브랜드로 갈 길까지 막을 이유가 없다.
   */
  const renderBody = () => {
    if (detailQuery.isPending && detailQuery.fetchStatus === "paused") {
      return (
        <View style={{ paddingTop: Spacing.section }}>
          <SectionError onRetry={() => void detailQuery.refetch()} />
          <View style={{ height: insets.bottom + Spacing.section }} />
        </View>
      );
    }

    if (detailQuery.isPending) {
      return <PromotionBodySkeleton bottomInset={insets.bottom} />;
    }

    // activeId 는 상세가 있으면 반드시 있다(없으면 쿼리가 enabled=false 로 idle 이다).
    // 타입을 좁히려고 여기 함께 둔다.
    if (detailQuery.isError || !detail || activeId === undefined) {
      return (
        <View style={{ paddingTop: Spacing.section }}>
          <SectionError onRetry={() => void detailQuery.refetch()} />
          <View style={{ height: insets.bottom + Spacing.section }} />
        </View>
      );
    }

    // 블록 순서는 웹 PromotionPage 와 같다 — 소개 · 룩북 · 상품 · 오프라인 팝업 ·
    // 온라인 쿠폰 · 공지 · 브랜드 띠. 전에는 쿠폰이 팝업보다 위에 있었다.
    return (
      <>
        <BrandIntroduction
          brand={detail.brand}
          brandPromotionId={activeId}
          promotionId={promotionId}
        />
        <BrandLookbook sectionList={detail.sectionList} />
        <ProductGrid
          heading={PRODUCTS_HEADING}
          items={detail.productList.map((product) => ({
            id: product.id,
            brandName: product.brandName,
            productName: product.productName,
            price: product.price,
            image: product.imageUrl,
          }))}
        />
        <BrandOfflinePopup popupList={detail.popupList} />
        <BrandOnlineEvent eventList={detail.eventList} />
        <PromotionNotices noticeList={detail.noticeList} />
        {/* 맨 아래 여백은 이 띠가 쥔다(안전 영역까지). 밑에 흰 줄을 남기지 않는다. */}
        <BrandFooterLinks brand={detail.brand} />
      </>
    );
  };

  return (
    <View className="bg-background flex-1">
      {/* 스크림이 고정이라 글리프가 항상 어두운 띠 위에 놓이므로 light 가 안전하다. */}
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          className="bg-surface-muted overflow-hidden"
          style={{ height: bannerHeight }}
        >
          {bannerUri ? (
            <Image
              contentFit="cover"
              source={bannerUri}
              style={{ width: "100%", height: "100%" }}
              transition={200}
            />
          ) : null}
        </View>
        {/* 브랜드가 하나뿐인 프로모션에는 고를 것이 없다. */}
        {brands.length > 1 && activeId !== undefined ? (
          <BrandSwitcher
            brands={brands}
            onSelect={setSelectedId}
            selectedId={activeId}
          />
        ) : null}
        {renderBody()}
      </ScrollView>
      <TopScrim height={insets.top + SCRIM_EXTRA_HEIGHT} />
      <BackButton />
    </View>
  );
}
