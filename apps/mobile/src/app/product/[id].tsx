import { useLocalSearchParams } from "expo-router";

import { ProductDetailScreen } from "@features/shop";

export default function ProductDetailRoute() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();

  return <ProductDetailScreen id={Number(rawId)} />;
}
