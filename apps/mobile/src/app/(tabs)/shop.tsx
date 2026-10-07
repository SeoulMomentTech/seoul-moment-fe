import { useRouter } from "expo-router";
import { FlatList, RefreshControl, View } from "react-native";

import { ProductCard } from "@entities/product/ui/ProductCard";
import { Touchable } from "@shared/ui/press";

import { BottomTabInset, Spacing } from "@/constants/theme";

import {
  CELL_WIDTH,
  GRID_GAP,
  GRID_PADDING,
  ShopEmpty,
  ShopFilterSheet,
  ShopFooter,
  ShopListHeader,
  ShopSortSheet,
  useInfiniteProducts,
  useRefreshShop,
  useShopSheetStore,
} from "@features/shop";

export default function ShopScreen() {
  const router = useRouter();
  const { isRefreshing, refresh } = useRefreshShop();
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteProducts();
  const filterOpen = useShopSheetStore((s) => s.filterOpen);
  const sortOpen = useShopSheetStore((s) => s.sortOpen);
  const setFilterOpen = useShopSheetStore((s) => s.setFilterOpen);
  const setSortOpen = useShopSheetStore((s) => s.setSortOpen);

  return (
    <View className="bg-background flex-1">
      <FlatList
        ListEmptyComponent={ShopEmpty}
        ListFooterComponent={ShopFooter}
        ListHeaderComponent={ShopListHeader}
        columnWrapperStyle={{
          // 행 안에서 셀을 가장 큰 높이로 늘리지 않는다. 상품명이 1~2줄이라
          // 행 하단이 들쭉날쭉한 것이 정상이다.
          alignItems: "flex-start",
          gap: GRID_GAP,
          paddingHorizontal: GRID_PADDING,
          marginBottom: Spacing.inner,
        }}
        contentContainerStyle={{
          paddingBottom: BottomTabInset + Spacing.section,
        }}
        data={data ?? []}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl onRefresh={refresh} refreshing={isRefreshing} />
        }
        renderItem={({ item }) => (
          <Touchable
            accessibilityLabel={item.productName}
            accessibilityRole="button"
            feedback="card"
            onPress={() => router.push(`/product/${item.id}`)}
            style={{ width: CELL_WIDTH }}
          >
            <ProductCard product={item} />
          </Touchable>
        )}
        showsVerticalScrollIndicator={false}
      />
      {/* 시트는 FlatList 밖(형제)에 둔다. 헤더 안에 두면 목록이 리렌더될 때 헤더의
          로컬 상태가 유실되어 열리자마자 닫힌다. 열림 상태는 store 로 끌어올렸다. */}
      <ShopFilterSheet
        onClose={() => setFilterOpen(false)}
        visible={filterOpen}
      />
      <ShopSortSheet onClose={() => setSortOpen(false)} visible={sortOpen} />
    </View>
  );
}
