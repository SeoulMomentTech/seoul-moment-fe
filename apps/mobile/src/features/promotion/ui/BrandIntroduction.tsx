import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { useOpenBrandShop } from "@features/shop/model/useOpenBrandShop";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import { shareWebLink } from "@shared/lib/share";
import type { BrandPromotionBrandDetail } from "@shared/services/brandPromotion";
import { Button } from "@shared/ui/button";
import { ShareIcon } from "@shared/ui/icons";
import { Touchable } from "@shared/ui/press";

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
/** 공유 단추. 44pt 터치 최소치이고, 로고(48)보다 낮아 윗줄 높이를 바꾸지 않는다. */
export const SHARE_BUTTON_SIZE = 44;
const SHARE_ICON_SIZE = 22;
// SVG 는 className 을 못 받아 --foreground 값을 직접 쓴다.
const SHARE_ICON_COLOR = "#171717";

/**
 * en.json 의 promotion_brand_notice. 앞뒤 공백만 떼고 그대로 쓴다 —
 * 감싼 별표는 웹에도 그대로 보이는 원문이라 여기서 고치지 않는다.
 */
const BRAND_NOTICE =
  "*Maximum discounts on promotional items may vary depending on stock availability and conditions.*";

interface BrandIntroductionProps {
  brand: BrandPromotionBrandDetail;
  /** 공유할 웹 주소를 짓는 데 쓴다. 웹은 이 둘을 주소 두 조각으로 들고 있다. */
  promotionId: number;
  brandPromotionId: number;
}

/**
 * 배너 바로 아래 붙는 전체 폭 소개 블록. 브랜드 상세(BrandScreen)와 같은 틀이다 —
 * 톤이 다른 면 위에 이름과 소개글, 그리고 더 볼 곳으로 가는 버튼 하나.
 *
 * 좋아요는 읽기 전용이다. 이 화면에는 좋아요를 바꾸는 수단이 없고(웹은 하트 버튼이 있다),
 * 숫자는 "얼마나 많은 사람이 고른 브랜드인가"를 말하는 메타라 body-5 로 둔다.
 * 공유는 웹과 같은 자리(블록 오른쪽 위)에 둔다.
 */
export function BrandIntroduction({
  brand,
  promotionId,
  brandPromotionId,
}: BrandIntroductionProps) {
  const router = useRouter();
  const language = useLanguage();
  const openBrandShop = useOpenBrandShop();

  return (
    <View className="bg-surface-muted px-5 pb-6 pt-6">
      <View className="flex-row items-start justify-between">
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
        {/* 웹은 "링크 복사" 하나뿐인 모달을 열지만, 여기서는 기기 공유 시트를 연다.
            주소는 이 화면에 해당하는 웹 주소다(앱 딥링크는 받은 사람이 못 연다). */}
        <Touchable
          accessibilityLabel={`Share ${brand.name}`}
          accessibilityRole="button"
          className="items-center justify-center rounded-full"
          onPress={() =>
            void shareWebLink({
              title: brand.name,
              path: `/${language}/promotion/${promotionId}/brand/${brandPromotionId}`,
            })
          }
          style={{ width: SHARE_BUTTON_SIZE, height: SHARE_BUTTON_SIZE }}
        >
          <ShareIcon color={SHARE_ICON_COLOR} size={SHARE_ICON_SIZE} />
        </Touchable>
      </View>
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
      {/* 웹과 같은 두 갈래다 — 브랜드를 더 보거나(Brand), 그 브랜드 상품을 사거나(Shop).
          글자도 웹의 promotion_brand / shop 을 그대로 쓰고, 무엇으로 가는지는
          낭독기가 읽는 이름에 풀어 둔다. */}
      <View className="mt-4 flex-row" style={{ gap: Spacing.tight }}>
        <Button
          accessibilityLabel={`View ${brand.name} brand page`}
          className="flex-1"
          label="Brand"
          onPress={() => router.push(`/brand/${brand.id}`)}
          size="md"
          variant="secondary"
        />
        <Button
          accessibilityLabel={`Shop ${brand.name} products`}
          className="flex-1"
          label="Shop"
          onPress={() => openBrandShop(brand.id)}
          size="md"
          variant="secondary"
        />
      </View>
    </View>
  );
}
