import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useOpenBrandShop } from "@features/shop/model/useOpenBrandShop";
import type { BrandPromotionBrandDetail } from "@shared/services/brandPromotion";
import { Button, BUTTON_HEIGHT } from "@shared/ui/button";

import { Spacing } from "@/constants/theme";

/** 로고 자리. 웹 모바일의 288x68 중 높이만 가져오고 폭은 화면에 맡긴다. */
export const FOOTER_LOGO_HEIGHT = 68;
/** 띠의 위아래 여백. 웹 모바일은 80 이지만 이 앱의 세로 리듬에는 그 값이 없다. */
const BAND_PADDING = Spacing.section;

/**
 * 색 값이 쓸 수 있는 것인지 본다. 웹(CSS)은 못 읽는 색을 무시하지만 RN 은 예외를 던져
 * 화면 전체가 날아간다 — 서버가 주는 값을 그대로 backgroundColor 에 넣을 수 없는 이유다.
 */
const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
/** 대표색이 없거나 읽을 수 없을 때. Section tone="dark" 와 같은 --foreground 다. */
const FALLBACK_COLOR = "#171717";

/**
 * 페이지를 끝내는 브랜드 대표색 띠. 웹 BrandLinksSection 과 같은 자리·같은 구성이다 —
 * 큰 로고 하나와 브랜드·상점으로 가는 버튼 둘.
 *
 * 이 띠가 화면 맨 아래를 자기가 쥔다(홈 인디케이터 높이까지 포함). 띠 밑에 흰 줄이
 * 남으면 색이 잘린 것처럼 보이기 때문에, 바깥에서 아래 여백을 따로 두지 않는다.
 */
export function BrandFooterLinks({
  brand,
}: {
  brand: BrandPromotionBrandDetail;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const openBrandShop = useOpenBrandShop();

  const backgroundColor = HEX_COLOR.test(brand.colorCode ?? "")
    ? brand.colorCode
    : FALLBACK_COLOR;

  return (
    <View
      style={{
        backgroundColor,
        paddingHorizontal: 20,
        paddingTop: BAND_PADDING,
        paddingBottom: BAND_PADDING + insets.bottom,
      }}
    >
      {brand.profileImageUrl ? (
        <Image
          contentFit="contain"
          source={brand.profileImageUrl}
          style={{ width: "100%", height: FOOTER_LOGO_HEIGHT }}
          transition={200}
        />
      ) : (
        // 로고가 없어도 띠 높이는 그대로다 — 있고 없고에 따라 68pt 가 사라지지 않게.
        <View style={{ height: FOOTER_LOGO_HEIGHT }} />
      )}
      <View
        className="flex-row"
        style={{ gap: Spacing.tight, marginTop: Spacing.inner }}
      >
        <Button
          accessibilityLabel={`View ${brand.name} brand page`}
          className="flex-1"
          label="Brand"
          onPress={() => router.push(`/brand/${brand.id}`)}
          size="md"
          variant="onColor"
        />
        <Button
          accessibilityLabel={`Shop ${brand.name} products`}
          className="flex-1"
          label="Shop"
          onPress={() => openBrandShop(brand.id)}
          size="md"
          variant="onColor"
        />
      </View>
    </View>
  );
}

/** 띠 전체 높이(아래 안전 영역 제외). 스켈레톤이 같은 값을 쓴다. */
export const FOOTER_BAND_HEIGHT =
  BAND_PADDING * 2 + FOOTER_LOGO_HEIGHT + Spacing.inner + BUTTON_HEIGHT.md;
