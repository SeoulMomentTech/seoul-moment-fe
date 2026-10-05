import { RefreshControl, ScrollView, View } from "react-native";

import { BottomTabInset, Spacing } from "@/constants/theme";

import {
  ArticleSection,
  HeroBanner,
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
      </ScrollView>
    </View>
  );
}
