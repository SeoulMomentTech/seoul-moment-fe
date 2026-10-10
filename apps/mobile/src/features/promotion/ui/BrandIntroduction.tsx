import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import type { BrandPromotionBrandDetail } from "@shared/services/brandPromotion";
import { Button } from "@shared/ui/button";

import { Spacing } from "@/constants/theme";

/**
 * 로고 자리. 가로세로 비율을 모르는 채로 자리를 잡아야 해서 상자를 고정하고 contain 으로 넣는다.
 * 웹 모바일(153x80)보다 납작한 것은 그 아래 소개글이 바로 와야 하기 때문이다.
 */
export const LOGO_HEIGHT = 48;
const LOGO_WIDTH = 140;
/** 소개글을 끊는 줄 수. 전문은 'View brand page' 가 가리키는 소개 화면에 있다. */
export const DESCRIPTION_LINES = 6;
export const DESCRIPTION_LINE_HEIGHT = 22;
/** 안내 문구를 끊는 줄 수. 길이가 데이터마다 달라도 자리 높이는 고정된다. */
export const NOTICE_LINES = 2;

/**
 * en.json 의 promotion_brand_notice. 앞뒤 공백만 떼고 그대로 쓴다 —
 * 감싼 별표는 웹에도 그대로 보이는 원문이라 여기서 고치지 않는다.
 */
const BRAND_NOTICE =
  "*Maximum discounts on promotional items may vary depending on stock availability and conditions.*";

interface BrandIntroductionProps {
  brand: BrandPromotionBrandDetail;
}

/**
 * 배너 바로 아래 붙는 전체 폭 소개 블록. 브랜드 상세(BrandScreen)와 같은 틀이다 —
 * 톤이 다른 면 위에 이름과 소개글, 그리고 더 볼 곳으로 가는 버튼 하나.
 *
 * 좋아요는 읽기 전용이다. 이 화면에는 좋아요를 바꾸는 수단이 없고(웹은 하트 버튼이 있다),
 * 숫자는 "얼마나 많은 사람이 고른 브랜드인가"를 말하는 메타라 body-5 로 둔다.
 */
export function BrandIntroduction({ brand }: BrandIntroductionProps) {
  const router = useRouter();

  return (
    <View className="bg-surface-muted px-5 pb-6 pt-6">
      {brand.profileImageUrl ? (
        <Image
          contentFit="contain"
          contentPosition="left"
          source={brand.profileImageUrl}
          style={{ width: LOGO_WIDTH, height: LOGO_HEIGHT }}
          transition={200}
        />
      ) : (
        // 로고가 없어도 자리는 남긴다 — 있고 없고에 따라 아래 글이 48pt 씩 튀지 않게.
        <View style={{ width: LOGO_WIDTH, height: LOGO_HEIGHT }} />
      )}
      <Text
        className="text-title-3 text-foreground font-bold"
        style={{ marginTop: 16 }}
      >
        {brand.name}
      </Text>
      <Text className="text-body-5 text-neutral mt-1">
        {`♡ ${brand.likeCount.toLocaleString("en-US")}`}
      </Text>
      {brand.description ? (
        <Text
          className="text-body-3 text-foreground"
          numberOfLines={DESCRIPTION_LINES}
          style={{ marginTop: 16, lineHeight: DESCRIPTION_LINE_HEIGHT }}
        >
          {brand.description}
        </Text>
      ) : null}
      <Text
        className="text-body-5 text-neutral"
        numberOfLines={NOTICE_LINES}
        style={{ marginTop: Spacing.tight }}
      >
        {BRAND_NOTICE}
      </Text>
      <Button
        accessibilityLabel={`View ${brand.name} brand page`}
        className="mt-4"
        label="View brand page"
        onPress={() => router.push(`/brand/${brand.id}`)}
        size="md"
        variant="secondary"
      />
    </View>
  );
}
