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

import { SectionError, SectionSkeleton } from "@shared/ui/section-state";

import { useInfiniteProducts } from "../model/useInfiniteProducts";
import { useProductBanner } from "../model/useProductBanner";
import { useProductCategories } from "../model/useProductCategories";
import { useProductSortOptions } from "../model/useProductSortOptions";
import { useShopFilterBadge } from "../model/useShopFilterBadge";
import { useShopFilterStore } from "../model/useShopFilterStore";
import { useShopSheetStore } from "../model/useShopSheetStore";

const SCREEN_WIDTH = Dimensions.get("window").width;
const BANNER_HEIGHT = 200;
const CATEGORY_IMAGE = 64;
const CATEGORY_ITEM_WIDTH = 72;
const CATEGORY_HEIGHT = 100;
const PRODUCT_LIST_HEIGHT = 360;

export const GRID_GAP = 12;
export const GRID_PADDING = 20;
// ProductCard 루트가 flex-1 이라 셀 너비를 고정해서 감싼다.
export const CELL_WIDTH = Math.floor(
  (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2,
);

function BannerPager() {
  const { data, isPending, isError, fetchStatus, refetch } = useProductBanner();
  const [page, setPage] = useState(0);

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (isPending && fetchStatus === "paused") {
    return <SectionError onRetry={() => void refetch()} />;
  }

  if (isPending) return <SectionSkeleton height={BANNER_HEIGHT} />;

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

function CategoryThumb({
  label,
  image,
  selected,
  onPress,
}: {
  label: string;
  image?: string;
  selected: boolean;
  onPress(): void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{ width: CATEGORY_ITEM_WIDTH, alignItems: "center" }}
    >
      <View
        className={
          selected
            ? "border-brand items-center justify-center border-2"
            : "border-neutral-subtle items-center justify-center border"
        }
        style={{
          width: CATEGORY_IMAGE,
          height: CATEGORY_IMAGE,
          borderRadius: CATEGORY_IMAGE / 2,
          overflow: "hidden",
        }}
      >
        {image ? (
          <Image
            contentFit="cover"
            source={image}
            style={{ width: "100%", height: "100%" }}
            transition={200}
          />
        ) : (
          <Text className="text-body-2 text-foreground font-bold">All</Text>
        )}
      </View>
      <Text
        className={
          selected
            ? "text-body-3 text-brand mt-2 font-bold"
            : "text-body-3 text-foreground mt-2"
        }
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CategoryScroller() {
  const { data, isPending, isError, fetchStatus, refetch } =
    useProductCategories();
  const categoryId = useShopFilterStore((s) => s.categoryId);
  const setFilter = useShopFilterStore((s) => s.setFilter);

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (isPending && fetchStatus === "paused") {
    return <SectionError onRetry={() => void refetch()} />;
  }

  if (isPending) return <SectionSkeleton height={CATEGORY_HEIGHT} />;

  if (isError) return <SectionError onRetry={() => void refetch()} />;

  if (!data || data.list.length === 0) return null;

  // 카테고리가 바뀌면 이전 카테고리의 옵션 id 는 의미가 없어서 같이 비운다.
  const select = (id: number | undefined) =>
    setFilter({ categoryId: id, optionIdList: [] });

  return (
    <FlatList
      ListHeaderComponent={
        <CategoryThumb
          label="All"
          onPress={() => select(undefined)}
          selected={categoryId == null}
        />
      }
      contentContainerStyle={{
        paddingHorizontal: GRID_PADDING,
        gap: 12,
      }}
      data={data.list}
      horizontal
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <CategoryThumb
          image={item.image}
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
  return (
    <>
      <BannerPager />
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

  if (isPending) return <SectionSkeleton height={PRODUCT_LIST_HEIGHT} />;

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
