import { useRouter } from "expo-router";
import { FlatList, Text, View } from "react-native";

import type { ProductItem } from "@shared/services/product";
import { Touchable } from "@shared/ui/press";

import { ProductCard } from "./ProductCard";

export const CAROUSEL_CARD_WIDTH = 150;
export const CAROUSEL_GAP = 12;
const PAGE_PADDING = 20;

interface ProductCarouselProps {
  heading: string;
  items: ProductItem[];
}

/**
 * 제목 + 가로로 넘기는 상품 카드 줄. 상품 상세의 Related Products 와
 * 브랜드 소개의 Brand Products 가 같은 모양이라 한 곳에 둔다.
 * 항목이 없으면 제목도 그리지 않는다 — 빈 제목만 남는 자리를 만들지 않는다.
 */
export function ProductCarousel({ heading, items }: ProductCarouselProps) {
  const router = useRouter();

  if (items.length === 0) {
    return null;
  }

  return (
    <View className="mt-12">
      <Text className="text-title-4 text-foreground mb-4 px-5 font-bold">
        {heading}
      </Text>
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: PAGE_PADDING,
          gap: CAROUSEL_GAP,
        }}
        data={items}
        horizontal
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Touchable
            accessibilityLabel={item.productName}
            accessibilityRole="button"
            feedback="card"
            onPress={() => router.push(`/product/${item.id}`)}
            style={{ width: CAROUSEL_CARD_WIDTH }}
          >
            <ProductCard product={item} />
          </Touchable>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}
