import { Image } from "expo-image";
import { Dimensions, FlatList, Text, View } from "react-native";

import type { HomePromotion } from "@shared/services/home";
import { Section } from "@shared/ui/section";
import { SectionError } from "@shared/ui/section-state";
import { HeroCardSkeleton } from "@shared/ui/skeleton";

import { useHomePromotion } from "../model/useHomePrime";

const HERO_HEIGHT = 200;
const CARD_WIDTH = Math.round(Dimensions.get("window").width * 0.72);
const CARD_HEIGHT = 160;

export function PromotionSection() {
  const {
    data: promotions,
    isPending,
    isError,
    fetchStatus,
    refetch,
  } = useHomePromotion();

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다. 스켈레톤을 영원히
  // 돌리지 말고 재시도 줄을 보여준다.
  if (isPending && fetchStatus === "paused") {
    return (
      <Section title="Season Collection">
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  if (isPending) {
    return (
      <Section title="Season Collection">
        {/* 프로모션이 1개면 히어로(200 + 12 + 19 + 4 + 2x17 = 269), 2개 이상이면
            캐러셀(160 + 12 + 19 + 4 + 2x17 = 229)이라 자리 높이가 40 다른데, 응답을
            받기 전에는 개수를 알 길이 없다. 히어로를 고른다 — dev 응답이 1개라
            일반적인 경우에 정확히 맞고, 캐러셀로 잡으면 그 일반적인 경우가 어긋난다.
            지난 개수를 기억해 두는 방법도 생각했지만 모듈 변수·ref·effect setState 가
            모두 이 저장소의 react-hooks 규칙에 걸린다. 그래서 2개 이상이 오면 섹션이
            46pt 줄어든다 — 알고 남겨두는 간극이다. 응답이 여러 개로 바뀌면 여기를
            HorizontalCardsSkeleton(cardWidth=CARD_WIDTH, imageHeight=CARD_HEIGHT)
            으로 바꾸면 된다. */}
        <HeroCardSkeleton imageHeight={HERO_HEIGHT} />
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
        className="text-body-2 text-foreground mt-3 font-bold"
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
