import { useLocalSearchParams } from "expo-router";

import { PromotionScreen } from "@features/promotion";

export default function PromotionRoute() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();

  return <PromotionScreen promotionId={Number(rawId)} />;
}
