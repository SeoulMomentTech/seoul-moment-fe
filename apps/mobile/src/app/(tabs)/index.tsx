import { RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRefreshHome } from "@features/home/model/useRefreshHome";

import { BottomTabInset, Spacing } from "@/constants/theme";

import {
  ArticleSection,
  HeroBanner,
  NewsSection,
  NowOnSaleSection,
  PromotionSection,
} from "@features/home";

export default function HomeScreen() {
  const { isRefreshing, refresh } = useRefreshHome();

  return (
    <SafeAreaView className="bg-background flex-1" edges={["top"]}>
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
    </SafeAreaView>
  );
}
