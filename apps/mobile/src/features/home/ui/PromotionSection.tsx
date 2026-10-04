import { Image } from "expo-image";
import { Dimensions, FlatList, Text, View } from "react-native";

import type { HomePromotion } from "@shared/services/home";
import { Section } from "@shared/ui/section";
import { SectionError, SectionSkeleton } from "@shared/ui/section-state";

import { useHomePromotion } from "../model/useHomePrime";

const HERO_HEIGHT = 200;
const CARD_WIDTH = Math.round(Dimensions.get("window").width * 0.72);
const CARD_HEIGHT = 160;

export function PromotionSection() {
  const { data: promotions, isPending, isError, refetch } = useHomePromotion();

  if (isPending) {
    return (
      <Section title="Season Collection">
        <SectionSkeleton height={HERO_HEIGHT} />
      </Section>
    );
  }

  if (isError) {
    return (
      <Section title="Season Collection">
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  // 빈 배열이면 섹션 자체를 렌더하지 않는다 (web SeasonCollection 과 같은 동작).
  if (!promotions || promotions.length === 0) return null;

  return (
    <Section title="Season Collection">
      {promotions.length === 1 ? (
        <View className="px-5">
          <PromotionHero promotion={promotions[0]} />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          data={promotions}
          horizontal
          keyExtractor={(item) => String(item.promotionId)}
          renderItem={({ item }) => <PromotionCard promotion={item} />}
          showsHorizontalScrollIndicator={false}
          snapToAlignment="start"
          snapToInterval={CARD_WIDTH + 12}
        />
      )}
    </Section>
  );
}

function PromotionHero({ promotion }: { promotion: HomePromotion }) {
  return (
    <View>
      <Image
        contentFit="cover"
        source={promotion.imageUrl}
        style={{ width: "100%", height: HERO_HEIGHT, borderRadius: 12 }}
        transition={200}
      />
      <Text
        className="text-body-2 text-foreground mt-3 font-bold"
        numberOfLines={1}
      >
        {promotion.title}
      </Text>
      {/* description 에 \n 이 섞여 온다 (dev 실데이터 확인). 줄 수를 묶어
          카드 높이가 데이터에 따라 출렁이지 않게 한다. */}
      <Text className="text-body-3 text-neutral mt-1" numberOfLines={2}>
        {promotion.description}
      </Text>
    </View>
  );
}

function PromotionCard({ promotion }: { promotion: HomePromotion }) {
  return (
    <View style={{ width: CARD_WIDTH }}>
      <Image
        contentFit="cover"
        source={promotion.imageUrl}
        style={{ width: "100%", height: CARD_HEIGHT, borderRadius: 12 }}
        transition={200}
      />
      <Text
        className="text-body-3 text-foreground mt-2 font-bold"
        numberOfLines={1}
      >
        {promotion.title}
      </Text>
      <Text className="text-body-3 text-neutral mt-1" numberOfLines={2}>
        {promotion.description}
      </Text>
    </View>
  );
}
