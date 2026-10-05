import { useState } from "react";

import { Image } from "expo-image";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

import { SectionError } from "@shared/ui/section-state";
import {
  BannerSkeleton,
  BrandHeaderSkeleton,
  CategoryChipsSkeleton,
  ProductGridSkeleton,
} from "@shared/ui/skeleton";

import { useBrandDetail } from "../model/useBrandDetail";
import { useCategories } from "../model/useCategories";
import { useInfiniteProducts } from "../model/useInfiniteProducts";
import { useProductBanner } from "../model/useProductBanner";
import { useProductSortOptions } from "../model/useProductSortOptions";
import { useShopFilterBadge } from "../model/useShopFilterBadge";
import { useShopFilterStore } from "../model/useShopFilterStore";
import { useShopSheetStore } from "../model/useShopSheetStore";

const SCREEN_WIDTH = Dimensions.get("window").width;
const BANNER_HEIGHT = 200;
// 칩 사이 간격. 필터 시트 칩(CHIP_GAP)과 같은 값이라 두 곳의 리듬이 맞는다.
const CATEGORY_CHIP_GAP = 8;

export const GRID_GAP = 12;
export const GRID_PADDING = 20;
// ProductCard 루트가 flex-1 이라 셀 너비를 고정해서 감싼다.
export const CELL_WIDTH = Math.floor(
  (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2,
);

/**
 * 브랜드 하나로 좁혔을 때 배너 자리에 들어가는 소개. 배너 + 이름 + 소개글만 둔다.
 * 좋아요·공유는 이 API 가 주지 않고(브랜드 프로모션 쪽 데이터다) 앱에 로그인도 없어서 뺐다.
 */
function BrandHeader({ id }: { id: number }) {
  const { data, isPending, isError, fetchStatus, refetch } = useBrandDetail(id);

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (isPending && fetchStatus === "paused") {
    return <SectionError onRetry={() => void refetch()} />;
  }

  if (isPending) return <BrandHeaderSkeleton bannerHeight={BANNER_HEIGHT} />;

  // 목록에 있는 브랜드인데 상세가 404 인 경우가 있다(dev 의 brand/1). 필터 자체는 멀쩡하므로
  // 에러 줄로 막지 말고 평소 배너로 돌아간다 — 못 그린 건 장식이지 기능이 아니다.
  if (isError || !data) return <BannerPager />;

  const banner = data.mobileBannerList?.[0] ?? data.bannerList?.[0];

  return (
    <View>
      {banner ? (
        <Image
          contentFit="cover"
          source={banner}
          style={{ width: SCREEN_WIDTH, height: BANNER_HEIGHT }}
          transition={200}
        />
      ) : null}
      <View className="px-5 pt-5">
        <Text className="text-title-4 text-foreground font-bold">
          {data.name}
        </Text>
        {data.description ? (
          <Text className="text-body-3 text-neutral mt-3">
            {data.description}
          </Text>
        ) : null}
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
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={
        selected
          ? "border-brand rounded-full border-2 px-4 py-2"
          : "border-neutral-subtle rounded-full border px-4 py-2"
      }
      onPress={onPress}
    >
      <Text
        className={
          selected
            ? "text-body-3 text-brand font-bold"
            : "text-body-3 text-foreground"
        }
      >
        {label}
      </Text>
    </Pressable>
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

  // 최상위 카테고리가 바뀌면 그 아래에 매달린 상품 카테고리와 옵션 id 는 모두 의미가 없어진다.
  const select = (id: number | undefined) =>
    setFilter({
      categoryId: id,
      productCategoryId: undefined,
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
      <Pressable
        accessibilityLabel="Filter"
        accessibilityRole="button"
        className="border-neutral-subtle flex-row items-center rounded-full border px-4 py-2"
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
      </Pressable>
      <Pressable
        accessibilityLabel="Sort"
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => setSortOpen(true)}
      >
        <Text className="text-body-3 text-foreground" numberOfLines={1}>
          {`${current?.name ?? "Sort"} ▾`}
        </Text>
      </Pressable>
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

  return (
    <View className="items-center px-5 py-12">
      <Text className="text-body-2 text-neutral">
        No products match these filters
      </Text>
    </View>
  );
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
