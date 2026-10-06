import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BackButton,
  SCRIM_EXTRA_HEIGHT,
  StatusScreen,
  TopScrim,
} from "@shared/ui/detail-chrome";
import { DetailSection, SECTION_GAP } from "@shared/ui/detail-section";
import { SectionError } from "@shared/ui/section-state";
import { DetailSkeleton } from "@shared/ui/skeleton";

import { BrandProducts } from "./BrandProducts";
import { useBrandDetail } from "../model/useBrandDetail";

const BANNER_HEIGHT = 300;
const LEAD_LINE_HEIGHT = 28;

/**
 * 브랜드 소개. 뉴스·아티클 상세와 같은 구성이다 — 풀블리드 배너에 이름을 얹고,
 * 그 아래 톤 다른 블록에 소개글, 그다음 본문 섹션들.
 * 날짜·작성자·관련 글이 없는 것만 다르다.
 */
export function BrandScreen({ id }: { id: number }) {
  const insets = useSafeAreaInsets();
  const { data, isPending, isError, fetchStatus, refetch } = useBrandDetail(id);

  // 잘못된 id 는 쿼리가 enabled=false 로 idle 에 머문다. 스켈레톤 대신 에러를 보여준다.
  if (!Number.isFinite(id)) {
    return (
      <StatusScreen>
        <SectionError onRetry={() => void refetch()} />
      </StatusScreen>
    );
  }

  // 오프라인이면 요청이 paused 되어 isPending 이 유지된다.
  if (isPending && fetchStatus === "paused") {
    return (
      <StatusScreen>
        <SectionError onRetry={() => void refetch()} />
      </StatusScreen>
    );
  }

  if (isPending) {
    return (
      <View className="bg-background flex-1">
        <StatusBar style="dark" />
        <BackButton />
        {/* 실제 배너는 상태바 밑까지 풀블리드(높이 + insets.top)다. StatusScreen 의 상단 패딩을 쓰면 배너가 그만큼 아래로 밀린다. */}
        {/* 브랜드 인트로는 바이라인이 없고 title-3 이름 한 줄이라 전용 variant 를 쓴다. */}
        <DetailSkeleton
          bannerHeight={BANNER_HEIGHT + insets.top}
          variant="brand"
        />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <StatusScreen>
        <SectionError onRetry={() => void refetch()} />
      </StatusScreen>
    );
  }

  const banner = data.mobileBannerList?.[0] ?? data.bannerList?.[0];

  return (
    <View className="bg-background flex-1">
      {/* 스크림이 고정이라 글리프가 항상 어두운 띠 위에 놓이므로 light 가 안전하다. */}
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          className="bg-surface-muted overflow-hidden"
          style={{ height: BANNER_HEIGHT + insets.top }}
        >
          {banner ? (
            <Image
              contentFit="cover"
              source={banner}
              style={{ width: "100%", height: "100%" }}
              transition={200}
            />
          ) : null}
        </View>
        {/* 배너 바로 아래에 붙는 전체 폭 인트로 블록. 가로 여백은 안쪽에서 준다. */}
        <View className="bg-surface-muted px-5 pb-8 pt-6">
          <Text className="text-title-3 text-foreground font-bold">
            {data.name}
          </Text>
          {data.description ? (
            <Text
              className="text-body-1 text-foreground mt-4"
              style={{ lineHeight: LEAD_LINE_HEIGHT }}
            >
              {data.description}
            </Text>
          ) : null}
        </View>
        {(data.section ?? []).map((section, index) => (
          <DetailSection
            // 첫 섹션만 좌우 교차 배치다. 웹도 여기서만 208x320 두 장을 엇갈려 세우고
            // 나머지 섹션은 넓은 이미지를 쓴다. 이미지가 1장뿐인 섹션을 교차시키면
            // 한쪽으로 치우친 것처럼만 보인다.
            imageLayout={index === 0 ? "staggered" : "stack"}
            // 정적 목록이라 순서가 바뀌지 않으므로 index 키가 안전하다.
            // eslint-disable-next-line react/no-array-index-key
            key={`${index}-${section.title}`}
            section={section}
          />
        ))}
        <BrandProducts brandId={id} />
        <View style={{ height: insets.bottom + SECTION_GAP }} />
      </ScrollView>
      <TopScrim height={insets.top + SCRIM_EXTRA_HEIGHT} />
      <BackButton />
    </View>
  );
}
