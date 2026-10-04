import { Text, View } from "react-native";

import { ProductCard } from "@entities/product/ui/ProductCard";
import { Section } from "@shared/ui/section";
import { SectionError, SectionSkeleton } from "@shared/ui/section-state";

import { useNowOnSale } from "../model/useHomeLists";

const GRID_HEIGHT = 420;

export function NowOnSaleSection() {
  const {
    data: products,
    isPending,
    isError,
    fetchStatus,
    refetch,
  } = useNowOnSale();

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다. 스켈레톤을 영원히
  // 돌리지 말고 재시도 줄을 보여준다.
  if (isPending && fetchStatus === "paused") {
    return (
      <Section title="Now On Sale">
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  if (isPending) {
    return (
      <Section title="Now On Sale">
        <SectionSkeleton height={GRID_HEIGHT} />
      </Section>
    );
  }

  if (isError) {
    return (
      <Section title="Now On Sale">
        <SectionError onRetry={() => void refetch()} />
      </Section>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <Section
      action={<Text className="text-body-3 text-neutral">View all</Text>}
      title="Now On Sale"
    >
      {/* 항목이 4개로 고정이라 가상화 이득이 없고, 바깥 ScrollView 안에
          세로 FlatList 를 중첩하지 않으려고 flex-wrap 으로 2열을 만든다. */}
      <View className="flex-row flex-wrap gap-3 px-5">
        {products.map((product) => (
          <View key={product.id} style={{ width: "47%" }}>
            <ProductCard product={product} />
          </View>
        ))}
      </View>
    </Section>
  );
}
