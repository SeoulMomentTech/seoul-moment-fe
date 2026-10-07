import { useState } from "react";

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Text,
  View,
} from "react-native";

import { Touchable } from "@shared/ui/press";
import { EmptyState, SectionError } from "@shared/ui/section-state";
import {
  BannerSkeleton,
  BrandHeaderSkeleton,
  CategoryChipsSkeleton,
  ProductGridSkeleton,
} from "@shared/ui/skeleton";

import { useCategories } from "../model/useCategories";
import { useInfiniteProducts } from "../model/useInfiniteProducts";
import { useProductBanner } from "../model/useProductBanner";
import { useProductBrandBanner } from "../model/useProductBrandBanner";
import { useProductSortOptions } from "../model/useProductSortOptions";
import { useShopFilterBadge } from "../model/useShopFilterBadge";
import { useShopFilterStore } from "../model/useShopFilterStore";
import { useShopSheetStore } from "../model/useShopSheetStore";

const SCREEN_WIDTH = Dimensions.get("window").width;
const BANNER_HEIGHT = 200;
// 칩 사이 간격. 필터 시트 칩(CHIP_GAP)과 같은 값이라 두 곳의 리듬이 맞는다.
const CATEGORY_CHIP_GAP = 8;
// 브랜드 소개글을 목록 헤더에서 끊는 줄 수. 스켈레톤도 같은 수를 쓴다.
const BRAND_DESCRIPTION_LINES = 3;

export const GRID_GAP = 12;
export const GRID_PADDING = 20;
// ProductCard 는 폭을 부모에게 맡기므로(w-full) 셀 너비를 여기서 정해 감싼다.
// 카드 쪽을 flex-1 로 되돌리면 flexBasis: 0 이 되어 이미지가 넘쳐 아래 행을 덮는다 — ProductCard 주석 참고.
export const CELL_WIDTH = Math.floor(
  (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2,
);

/**
 * 브랜드 하나로 좁혔을 때 배너 자리에 들어가는 소개. product/banner/brand 가 이 자리를 위해
 * 배너·이름·영문명·소개글·좋아요 수를 한 번에 준다.
 * 좋아요는 읽기 전용이다 — 앱에 로그인이 없어 isLiked 를 바꿀 수단이 없다.
 */
function BrandHeader({ id }: { id: number }) {
  const router = useRouter();
  const { data, isPending, isError, fetchStatus, refetch } =
    useProductBrandBanner(id);

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (isPending && fetchStatus === "paused") {
    return <SectionError onRetry={() => void refetch()} />;
  }

  if (isPending) return <BrandHeaderSkeleton bannerHeight={BANNER_HEIGHT} />;

  // 목록에 있는 브랜드인데 404 인 경우가 있다(dev 의 1번). 필터 자체는 멀쩡하므로
  // 에러 줄로 막지 말고 평소 배너로 돌아간다 — 못 그린 건 장식이지 기능이 아니다.
  if (isError || !data) return <BannerPager />;

  // 한국어로 보면 name 이 "취(Chwi)", englishName 이 "Chwi" 라 같은 줄이 두 번 되지 않는다.
  // 영어로 보면 둘이 같아지므로 그때는 영문명을 뺀다.
  const showEnglishName = Boolean(
    data.englishName && data.englishName !== data.name,
  );

  return (
    <View>
      {data.banner ? (
        <Image
          contentFit="cover"
          source={data.banner}
          style={{ width: SCREEN_WIDTH, height: BANNER_HEIGHT }}
          transition={200}
        />
      ) : null}
      <View className="px-5 pt-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-title-4 text-foreground flex-1 font-bold">
            {data.name}
          </Text>
          {data.like > 0 ? (
            <Text className="text-body-3 text-neutral ml-3">
              {`♡ ${data.like.toLocaleString("en-US")}`}
            </Text>
          ) : null}
        </View>
        {showEnglishName ? (
          <Text className="text-body-3 text-neutral mt-1">
            {data.englishName}
          </Text>
        ) : null}
        {data.description ? (
          // 소개글은 170~400자라 다 펼치면 상품 그리드가 화면 밖으로 밀린다. 3줄에서 끊고
          // 전문은 소개 페이지에 맡긴다. 기본 ellipsizeMode 가 tail 이라 끝에 … 가 붙는다.
          <Text
            className="text-body-3 text-foreground mt-3"
            numberOfLines={BRAND_DESCRIPTION_LINES}
          >
            {data.description}
          </Text>
        ) : null}
        <Touchable
          accessibilityLabel={`View ${data.name} brand page`}
          accessibilityRole="button"
          className="border-neutral-subtle mt-4 items-center rounded-full border py-3"
          onPress={() => router.push(`/brand/${id}`)}
        >
          <Text className="text-body-3 text-foreground font-bold">
            View brand page
          </Text>
        </Touchable>
      </View>
    </View>
  );
}

function BannerPager() {
  const { data, isPending, isError, fetchStatus, refetch } = useProductBanner();
  const [page, setPage] = useState(0);

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (isPending && fetchStatus === "paused") {
    return <SectionError onRetry={() => void refetch()} />;
  }

  if (isPending) return <BannerSkeleton height={BANNER_HEIGHT} />;

  if (isError) return <SectionError onRetry={() => void refetch()} />;

  if (!data || data.list.length === 0) return null;

  return (
    <View>
      <FlatList
        data={data.list}
        horizontal
        keyExtractor={(item) => item.banner}
        onMomentumScrollEnd={(e) =>
          setPage(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH))
        }
        pagingEnabled
        renderItem={({ item }) => (
          <Image
            contentFit="cover"
            source={item.mobileBanner ?? item.banner}
            style={{ width: SCREEN_WIDTH, height: BANNER_HEIGHT }}
            transition={200}
          />
        )}
        showsHorizontalScrollIndicator={false}
      />
      {data.list.length > 1 ? (
        <View className="mt-3 flex-row items-center justify-center gap-2">
          {data.list.map((item, index) => (
            <View
              className={index === page ? "bg-foreground" : "bg-neutral-subtle"}
              key={item.banner}
              style={{ width: 6, height: 6, borderRadius: 3 }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/**
 * 카테고리 칩. 필터 시트의 Chip 과 같은 모양(rounded-full, px-4 py-2)이라
 * 상품 목록 안에서 '고르는 것'은 전부 같은 생김새를 갖는다.
 * 폭을 글자에 맡기므로 긴 이름도 잘리지 않는다.
 *
 * 선택은 테두리 두께가 아니라 채움으로 나타낸다. border-2 로 바꾸면 상자가 가로·세로로
 * 2pt 씩 커져 오른쪽 칩들이 전부 밀리고 스켈레톤(CHIP_HEIGHT=35)과도 어긋난다.
 * 글자 굵기도 그대로 둬야 글자 폭이 안 변한다 — 대비는 bg-brand 가 충분히 준다.
 */
function CategoryChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress(): void;
}) {
  return (
    <Touchable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={
        selected
          ? "bg-brand border-brand rounded-full border px-4 py-2"
          : "border-neutral-subtle rounded-full border px-4 py-2"
      }
      // 칩 높이가 35pt 라 위아래로 5pt 씩 넓혀 44pt 최소 터치 영역을 맞춘다.
      // 칩 사이 간격이 8pt 뿐이라 좌우는 넓히지 않는다.
      hitSlop={{ top: 5, bottom: 5 }}
      onPress={onPress}
    >
      <Text
        className={
          selected
            ? "text-body-3 text-background"
            : "text-body-3 text-foreground"
        }
      >
        {label}
      </Text>
    </Touchable>
  );
}

/**
 * 최상위 카테고리 칩 줄(패션·화장품·악세서리). 여기서 고르는 것은 categoryId 다.
 * 그 아래 상품 카테고리(후드/집업 등)는 필터 시트가 고르고, 이 선택으로 좁혀진다.
 */
function CategoryScroller() {
  const categoryId = useShopFilterStore((s) => s.categoryId);
  const setFilter = useShopFilterStore((s) => s.setFilter);
  const { data, isPending, isError, fetchStatus, refetch } = useCategories();

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (isPending && fetchStatus === "paused") {
    return <SectionError onRetry={() => void refetch()} />;
  }

  // 실제 스크롤러가 marginTop 20 을 가지므로 같은 여백을 감싸서 준다.
  if (isPending) {
    return (
      <View style={{ marginTop: 20 }}>
        <CategoryChipsSkeleton />
      </View>
    );
  }

  if (isError) return <SectionError onRetry={() => void refetch()} />;

  if (!data || data.list.length === 0) return null;

  // 최상위 카테고리가 바뀌면 그 아래에 매달린 상품 카테고리·브랜드·옵션 id 가 모두 의미를 잃는다.
  // 브랜드는 카테고리와 독립된 축처럼 보이지만 실제로는 대부분의 조합에 상품이 없다
  // (dev 기준 15개 조합 중 10개가 0건). 남겨 두면 카테고리를 바꾼 순간 빈 목록이 된다.
  const select = (id: number | undefined) =>
    setFilter({
      categoryId: id,
      productCategoryId: undefined,
      brandId: undefined,
      optionIdList: [],
    });

  return (
    <FlatList
      ListHeaderComponent={
        <CategoryChip
          label="All"
          onPress={() => select(undefined)}
          selected={categoryId == null}
        />
      }
      contentContainerStyle={{
        paddingHorizontal: GRID_PADDING,
        gap: CATEGORY_CHIP_GAP,
      }}
      data={data.list}
      horizontal
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <CategoryChip
          label={item.name}
          onPress={() => select(item.id === categoryId ? undefined : item.id)}
          selected={item.id === categoryId}
        />
      )}
      showsHorizontalScrollIndicator={false}
      style={{ marginTop: 20, flexGrow: 0 }}
    />
  );
}

function FilterBar() {
  const badge = useShopFilterBadge();
  const { data: sortOptions } = useProductSortOptions();
  const sortColumn = useShopFilterStore((s) => s.sortColumn);
  const sort = useShopFilterStore((s) => s.sort);
  const setFilterOpen = useShopSheetStore((s) => s.setFilterOpen);
  const setSortOpen = useShopSheetStore((s) => s.setSortOpen);

  const current = sortOptions?.list.find(
    (o) => o.sortColumn === sortColumn && o.sort === sort,
  );

  return (
    <View className="mb-4 mt-5 flex-row items-center justify-between px-5">
      <Touchable
        accessibilityLabel="Filter"
        accessibilityRole="button"
        className="border-neutral-subtle flex-row items-center rounded-full border px-4 py-2"
        // 칩과 같은 35pt 높이라 위아래 5pt 씩 넓혀 44pt 를 넘긴다.
        hitSlop={{ top: 5, bottom: 5 }}
        onPress={() => setFilterOpen(true)}
      >
        <Text className="text-body-3 text-foreground font-bold">Filter</Text>
        {badge > 0 ? (
          <View
            className="bg-brand ml-2 items-center justify-center"
            style={{ minWidth: 18, height: 18, borderRadius: 9 }}
          >
            <Text className="text-body-3 text-background font-bold">
              {badge}
            </Text>
          </View>
        ) : null}
      </Touchable>
      <Touchable
        accessibilityLabel="Sort"
        accessibilityRole="button"
        // 글자 한 줄(17pt)뿐이라 8 로는 33pt 에 그친다. 14 로 45pt 를 만든다.
        hitSlop={14}
        onPress={() => setSortOpen(true)}
      >
        <Text className="text-body-3 text-foreground" numberOfLines={1}>
          {`${current?.name ?? "Sort"} ▾`}
        </Text>
      </Touchable>
    </View>
  );
}

export function ShopListHeader() {
  const brandId = useShopFilterStore((s) => s.brandId);

  return (
    <>
      {/* 브랜드를 고르면 배너 자리를 그 브랜드 소개가 대신한다. 배너가 둘 쌓이지 않게 교체한다. */}
      {brandId == null ? <BannerPager /> : <BrandHeader id={brandId} />}
      <CategoryScroller />
      <FilterBar />
    </>
  );
}

/**
 * 상품이 하나도 없을 때만 FlatList 가 그린다. 가드 순서는 홈 섹션과 같다.
 */
export function ShopEmpty() {
  const { isPending, isError, fetchStatus, refetch } = useInfiniteProducts();

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (isPending && fetchStatus === "paused") {
    return <SectionError onRetry={() => void refetch()} />;
  }

  if (isPending) return <ProductGridSkeleton variant="shop" />;

  if (isError) return <SectionError onRetry={() => void refetch()} />;

  return <EmptyState message="No products match these filters" />;
}

export function ShopFooter() {
  const { isFetchingNextPage } = useInfiniteProducts();

  if (!isFetchingNextPage) return null;

  return (
    <View className="py-6">
      <ActivityIndicator />
    </View>
  );
}
