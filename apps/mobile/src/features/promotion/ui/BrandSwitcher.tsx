import { ScrollView, View } from "react-native";

import type { BrandPromotionBrand } from "@shared/services/brandPromotion";
import { CHIP_GAP, Chip } from "@shared/ui/chip";
import { CHIP_HEIGHT } from "@shared/ui/skeleton";

import { Spacing } from "@/constants/theme";

/** 줄 높이 = 위 12 + 칩 35 + 아래 12 + 아래 테두리 1. 스켈레톤이 같은 값을 쓴다. */
export const SWITCHER_HEIGHT = Spacing.tight * 2 + CHIP_HEIGHT + 1;

interface BrandSwitcherProps {
  brands: BrandPromotionBrand[];
  /** 고른 브랜드의 brandPromotionId. */
  selectedId: number;
  onSelect(brandPromotionId: number): void;
}

/**
 * 한 프로모션에 브랜드가 둘 이상일 때만 나오는 전환 줄. 웹은 브랜드마다 URL 을 따로 두고
 * 탭을 누를 때 화면을 밀지만, 폰에서 탭 하나에 화면 하나를 쌓는 것은 뒤로가기 더미만 만든다.
 * 여기서는 같은 화면 안에서 상세 쿼리의 키만 바꾼다.
 *
 * 생김새는 앱의 "고르는 알약"(Chip) 그대로다. 웹처럼 동그란 프로필 사진을 얹지 않는 것은
 * shared/ui/chip 에 적힌 결정을 따른 것이다 — 사진은 이름이 이미 말한 것을 더하지 않는다.
 * 탭이라 고른 것을 다시 눌러도 비워지지 않는다(ChipRow 를 쓰지 않는 이유다).
 */
export function BrandSwitcher({
  brands,
  selectedId,
  onSelect,
}: BrandSwitcherProps) {
  return (
    <View
      className="border-neutral-subtle bg-background border-b"
      style={{ paddingVertical: Spacing.tight }}
    >
      <ScrollView
        accessibilityLabel="Brands in this promotion"
        contentContainerStyle={{ paddingHorizontal: 20, gap: CHIP_GAP }}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
      >
        {brands.map((brand) => (
          <Chip
            key={brand.id}
            label={brand.name}
            onPress={() => onSelect(brand.id)}
            selected={brand.id === selectedId}
          />
        ))}
      </ScrollView>
    </View>
  );
}
