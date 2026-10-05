import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

import type { NewsLastItem } from "@shared/services/news";

const CARD_WIDTH = 220;
const IMAGE_HEIGHT = 140;
const CARD_GAP = 12;

/**
 * 뉴스 상세 맨 아래 관련 뉴스. 웹 RelatedList 의 모바일 구간처럼 중립 회색 배경 위에
 * 제목 줄 + 가로 카드 캐러셀을 둔다. 항목이 없으면 제목도 틀도 그리지 않는다.
 */
export function RelatedNews({ items }: { items?: NewsLastItem[] }) {
  const router = useRouter();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <View className="bg-surface-muted mt-16 pb-12 pt-10">
      <View className="mb-5 flex-row items-end justify-between px-5">
        <Text className="text-title-4 text-foreground font-bold">
          More News
        </Text>
        <Pressable
          accessibilityLabel="More News"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.push("/news")}
        >
          <Text className="text-body-3 text-brand font-semibold">View all</Text>
        </Pressable>
      </View>
      {/* 세로 ScrollView 안의 가로 리스트라 중첩 스크롤 문제가 없다. */}
      <FlatList
        contentContainerStyle={{ paddingHorizontal: 20, gap: CARD_GAP }}
        data={items}
        horizontal
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable
            accessibilityLabel={item.title}
            accessibilityRole="button"
            onPress={() => router.push(`/news/${item.id}`)}
            style={{ width: CARD_WIDTH }}
          >
            <Image
              contentFit="cover"
              source={item.banner}
              // 높이를 고정해 느리거나 404 인 배너가 레이아웃을 밀지 않게 한다.
              style={{
                width: CARD_WIDTH,
                height: IMAGE_HEIGHT,
                borderRadius: 12,
              }}
              transition={200}
            />
            <Text
              className="text-body-2 text-foreground mt-3 font-semibold"
              numberOfLines={2}
            >
              {item.title}
            </Text>
          </Pressable>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}
