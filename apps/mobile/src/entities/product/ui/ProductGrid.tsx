import { useRouter } from "expo-router";
import { View, useWindowDimensions } from "react-native";

import { Touchable } from "@shared/ui/press";
import { Section } from "@shared/ui/section";

import { Spacing } from "@/constants/theme";

import { ProductCard, type ProductCardItem } from "./ProductCard";

const PAGE_PADDING = 20;
/** 열 사이. 칸 폭을 구하는 식이 shapes.tsx 의 variant="shop" 과 같아야 한다. */
export const GRID_COLUMN_GAP = 12;
/** 행 사이. 카드 밑에 글이 세 줄 붙어 있어 열 간격보다 넓어야 행이 갈린다. */
export const GRID_ROW_GAP = Spacing.inner;

/** 2열 그리드의 칸 폭. ProductGridSkeleton(variant="shop") 과 같은 식이다. */
export const gridCellWidth = (screenWidth: number) =>
  Math.floor((screenWidth - PAGE_PADDING * 2 - GRID_COLUMN_GAP) / 2);

interface ProductGridProps {
  heading: string;
  items: ProductCardItem[];
}

/**
 * 제목 + 2열 상품 그리드. 가로 캐러셀(ProductCarousel)과 짝이고, 둘 중 어느 것을 쓸지는
 * 그 상품이 화면의 곁다리인지 본론인지로 가른다 — 관련 상품은 줄로, 프로모션이 팔려는
 * 상품은 그리드로. 웹도 프로모션 상세에서만 이 자리를 grid-cols-2 로 편다.
 *
 * 목록이 짧아(응답이 주는 만큼) FlatList 를 쓰지 않는다. 이 화면은 통째로 ScrollView 안이라
 * 안에 세로 FlatList 를 넣으면 가상화가 꺼진 채 경고만 남는다.
 */
export function ProductGrid({ heading, items }: ProductGridProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();

  if (items.length === 0) {
    return null;
  }

  const cell = gridCellWidth(width);

  return (
    <Section title={heading}>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          paddingHorizontal: PAGE_PADDING,
          columnGap: GRID_COLUMN_GAP,
          rowGap: GRID_ROW_GAP,
        }}
      >
        {items.map((item) => (
          <Touchable
            accessibilityLabel={item.productName}
            accessibilityRole="button"
            feedback="card"
            key={item.id}
            onPress={() => router.push(`/product/${item.id}`)}
            style={{ width: cell }}
          >
            <ProductCard product={item} />
          </Touchable>
        ))}
      </View>
    </Section>
  );
}
