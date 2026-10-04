import { Image } from "expo-image";
import { View } from "react-native";

import { SectionError, SectionSkeleton } from "@shared/ui/section-state";

import { useHomeBanner } from "../model/useHomePrime";

const BANNER_HEIGHT = 220;

export function HeroBanner() {
  const { data: banner, isPending, isError, refetch } = useHomeBanner();

  if (isPending) return <SectionSkeleton height={BANNER_HEIGHT} />;
  if (isError) return <SectionError onRetry={() => void refetch()} />;
  // banner 배열이 비면 select 가 undefined 를 준다. 빈 이미지를 띄우지 않는다.
  if (!banner) return null;

  return (
    <View style={{ height: BANNER_HEIGHT }}>
      <Image
        contentFit="cover"
        source={banner.mobileImageUrl || banner.imageUrl}
        style={{ width: "100%", height: "100%" }}
        transition={200}
      />
    </View>
  );
}
