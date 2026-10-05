import { useLocalSearchParams } from "expo-router";

import { BrandScreen } from "@features/brand";

export default function BrandRoute() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();

  return <BrandScreen id={Number(rawId)} />;
}
