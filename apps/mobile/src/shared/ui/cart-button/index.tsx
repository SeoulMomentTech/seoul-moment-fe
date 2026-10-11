import { useRouter } from "expo-router";
import { Animated, Text } from "react-native";

import { CartIcon } from "@shared/ui/icons";
import { Touchable } from "@shared/ui/press";

import { cartBadgeCollapse } from "./collapse";

// className 을 받지 못하는 SVG 라 토큰 값을 직접 쓴다.
const FOREGROUND = "#171717";
const ON_PHOTO = "#FFFFFF";
const ICON_SIZE = 22;
/** 아이콘이 22pt 라 11 로 넓혀 44pt 터치 영역을 맞춘다. */
const HIT_SLOP = 11;
/** 사진 위 동그라미. 떠 있는 뒤로가기(detail-chrome)와 같은 지름·같은 색이다. */
const OVERLAY_SIZE = 36;
const OVERLAY_BACKGROUND = "rgba(0,0,0,0.45)";
/** 뱃지 지름. body-5(12) 한 줄에 위아래 3pt 씩. */
const BADGE_SIZE = 18;
/** 이보다 많으면 정확한 수를 세는 뜻이 없다. 자릿수가 늘어 뱃지가 아이콘을 덮기도 한다. */
const MAX_BADGE_COUNT = 99;
/** 접혔을 때의 크기. 18pt 뱃지가 8pt 점이 된다 — 숫자는 못 읽어도 있다는 것은 남는다. */
const COLLAPSED_SCALE = 0.45;

const badgeScale = cartBadgeCollapse.interpolate({
  inputRange: [0, 1],
  outputRange: [1, COLLAPSED_SCALE],
});

// 숫자는 크기보다 먼저 사라진다. 끝까지 남겨 두면 줄어드는 동안 뭉개진 글자가 보인다.
const countOpacity = cartBadgeCollapse.interpolate({
  inputRange: [0, 0.5],
  outputRange: [1, 0],
  extrapolate: "clamp",
});

/**
 * plain   — 흰 머리 막대 위. 검은 글리프만 둔다.
 * overlay — 사진 위에 떠 있는 자리. 어두운 동그라미에 흰 글리프다.
 */
export type CartButtonTone = "plain" | "overlay";

interface CartButtonViewProps {
  /**
   * 장바구니 줄 수. **모르면 넘기지 않는다** — 로그아웃·로딩·실패가 모두 여기 해당한다.
   * 0 과 구분되어야 한다: 0 은 "비었다"는 사실이고 undefined 는 "아직 모른다"이다.
   * 뱃지는 둘 다 그리지 않지만, 읽어 주는 이름은 달라진다.
   */
  count?: number;
  tone?: CartButtonTone;
}

/**
 * 장바구니로 가는 단추. 수를 묻지 않고 받는다 — shared 는 앱에서 가장 아래 층이라
 * entities 의 쿼리를 끌어오면 의존이 거꾸로 선다. 묻는 일은 위층(entities/cart 의
 * CartButton, 탭 레이아웃)이 하고 여기서는 받은 숫자를 어떻게 보일지만 정한다.
 */
export function CartButtonView({ count, tone = "plain" }: CartButtonViewProps) {
  const router = useRouter();

  // 뱃지는 "기다리는 것이 있다"고 말하는 표시다. 셀 것이 없으면(0) 그 말이 거짓이고,
  // 아직 모르면(undefined) 아무 말도 할 수 없다. 두 경우 모두 그리지 않는다 —
  // 특히 모를 때의 0 은 "장바구니가 비었다"는 틀린 확언이 된다.
  const hasBadge = count != null && count > 0;
  const overlay = tone === "overlay";

  return (
    <Touchable
      accessibilityLabel={hasBadge ? `Cart, ${count} items` : "Cart"}
      accessibilityRole="button"
      className={
        overlay ? "items-center justify-center rounded-full" : undefined
      }
      // 사진 위에 뜬 어두운 원이라 흰 리플을 쓰는 overlay 를 고른다.
      feedback={overlay ? "overlay" : "surface"}
      hitSlop={overlay ? 8 : HIT_SLOP}
      onPress={() => router.push("/cart")}
      style={
        overlay
          ? {
              width: OVERLAY_SIZE,
              height: OVERLAY_SIZE,
              backgroundColor: OVERLAY_BACKGROUND,
            }
          : undefined
      }
    >
      <CartIcon color={overlay ? ON_PHOTO : FOREGROUND} size={ICON_SIZE} />
      {hasBadge ? (
        // 수는 바로 옆 이름("Cart, 3 items")이 이미 말하므로 따로 읽어 주지 않는다.
        <Animated.View
          accessibilityElementsHidden
          className="bg-brand absolute items-center justify-center rounded-full"
          importantForAccessibility="no-hide-descendants"
          style={{
            top: overlay ? -4 : -6,
            right: overlay ? -4 : -8,
            height: BADGE_SIZE,
            minWidth: BADGE_SIZE,
            paddingHorizontal: 4,
            transform: [{ scale: badgeScale }],
          }}
        >
          {/* 투명도는 글자가 아니라 상자에 건다 — Animated.Text 는 이 앱에서 쓴 적이 없다. */}
          <Animated.View style={{ opacity: countOpacity }}>
            <Text className="text-body-5 text-background font-bold">
              {count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : count}
            </Text>
          </Animated.View>
        </Animated.View>
      ) : null}
    </Touchable>
  );
}
