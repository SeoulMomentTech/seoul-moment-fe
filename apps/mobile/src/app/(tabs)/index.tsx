import { RefreshControl, ScrollView, View } from "react-native";

import { BottomTabInset, Spacing } from "@/constants/theme";

import {
  ArticleSection,
  HeroBanner,
  HomeEmpty,
  NewsSection,
  NowOnSaleSection,
  PromotionSection,
  useRefreshHome,
} from "@features/home";

export default function HomeScreen() {
  const { isRefreshing, refresh } = useRefreshHome();

  return (
    <View className="bg-background flex-1">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: BottomTabInset + Spacing.five,
        }}
        refreshControl={
          <RefreshControl onRefresh={refresh} refreshing={isRefreshing} />
        }
        showsVerticalScrollIndicator={false}
      >
        <HeroBanner />
        <PromotionSection />
        <NowOnSaleSection />
        <NewsSection />
        <ArticleSection />
        {/* 위 다섯이 모두 빈 응답이면 그때만 그려진다. 평소에는 null 이다. */}
        <HomeEmpty />
      </ScrollView>
    </View>
  );
}
