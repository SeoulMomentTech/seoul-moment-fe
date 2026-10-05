import { Image } from "expo-image";
import { View } from "react-native";

import { SectionError } from "@shared/ui/section-state";

import { useHomeBanner } from "../model/useHomePrime";

const BANNER_HEIGHT = 220;

export function HeroBanner() {
  const {
    data: banner,
    isPending,
    isError,
    fetchStatus,
    refetch,
  } = useHomeBanner();

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다. 스켈레톤을 영원히
  // 돌리지 말고 재시도 줄을 보여준다.
  if (isPending && fetchStatus === "paused") {
    return <SectionError onRetry={() => void refetch()} />;
  }
  // SectionSkeleton 은 mx-5 + 둥근 모서리라 풀블리드 배너와 어긋난다. 여기서만 직접 그린다.
  if (isPending) {
    return (
      <View className="bg-neutral-subtle" style={{ height: BANNER_HEIGHT }} />
    );
  }
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
