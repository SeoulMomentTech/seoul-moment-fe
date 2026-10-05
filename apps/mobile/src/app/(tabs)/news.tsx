import { FlatList, RefreshControl, View } from "react-native";

import { PostRow } from "@entities/post/ui/PostRow";
import { useInfiniteNewsByCategory } from "@features/news/model/useInfiniteNewsByCategory";

import { BottomTabInset, Spacing } from "@/constants/theme";

import {
  LifestyleEmpty,
  LifestyleFooter,
  LifestyleHeader,
  NewsDashboardSections,
  useRefreshNews,
} from "@features/news";

function NewsListHeader() {
  return (
    <>
      <NewsDashboardSections />
      <LifestyleHeader />
    </>
  );
}

export default function NewsScreen() {
  const { isRefreshing, refresh } = useRefreshNews();
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteNewsByCategory();

  return (
    <View className="bg-background flex-1">
      <FlatList
        ListEmptyComponent={LifestyleEmpty}
        ListFooterComponent={LifestyleFooter}
        ListHeaderComponent={NewsListHeader}
        contentContainerStyle={{
          paddingBottom: BottomTabInset + Spacing.five,
        }}
        data={data ?? []}
        keyExtractor={(item) => String(item.id)}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl onRefresh={refresh} refreshing={isRefreshing} />
        }
        renderItem={({ item }) => (
          <PostRow
            createDate={item.createDate}
            imageUrl={item.homeImage}
            title={item.title}
            writer={item.writer}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
