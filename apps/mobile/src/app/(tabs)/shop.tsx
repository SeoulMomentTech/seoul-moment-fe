import { FlatList, RefreshControl, View } from "react-native";

import { ProductCard } from "@entities/product/ui/ProductCard";

import { BottomTabInset, Spacing } from "@/constants/theme";

import {
  CELL_WIDTH,
  GRID_GAP,
  GRID_PADDING,
  ShopEmpty,
  ShopFooter,
  ShopListHeader,
  useInfiniteProducts,
  useRefreshShop,
} from "@features/shop";

export default function ShopScreen() {
  const { isRefreshing, refresh } = useRefreshShop();
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteProducts();

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
          marginBottom: Spacing.four,
        }}
        contentContainerStyle={{
          paddingBottom: BottomTabInset + Spacing.five,
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
          <View style={{ width: CELL_WIDTH }}>
            <ProductCard product={item} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
