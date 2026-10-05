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
