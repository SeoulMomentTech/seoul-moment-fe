import { useRouter } from "expo-router";
import { FlatList, RefreshControl, View } from "react-native";

import { PostRow } from "@entities/post/ui/PostRow";
import { Touchable } from "@shared/ui/press";

import { BottomTabInset, Spacing } from "@/constants/theme";

import {
  LifestyleEmpty,
  LifestyleFooter,
  LifestyleHeader,
  NewsDashboardSections,
  useInfiniteNewsByCategory,
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
  const router = useRouter();
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
          <Touchable
            accessibilityLabel={item.title}
            accessibilityRole="button"
            onPress={() => router.push(`/news/${item.id}`)}
          >
            <PostRow
              createDate={item.createDate}
              imageUrl={item.homeImage}
              title={item.title}
              writer={item.writer}
            />
          </Touchable>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
