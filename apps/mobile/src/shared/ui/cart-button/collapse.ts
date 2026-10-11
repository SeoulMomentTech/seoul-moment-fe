import { useCallback, useRef } from "react";

import { useFocusEffect } from "expo-router";
import { Animated, Easing } from "react-native";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

/**
 * 뱃지가 접힌 정도. 0 이 제 크기, 1 이 점이다.
 *
 * 값을 하나만 둔다 — 화면에 머리는 언제나 하나뿐이고, Shimmer 가 모든 블록에
 * 값 하나를 쓰는 것과 같은 이유다. 접힘은 탭 머리와 상세의 떠 있는 단추가 같이 쓴다.
 */
export const cartBadgeCollapse = new Animated.Value(0);

const DURATION_MS = 180;
/** 맨 위 근처에서는 접지 않는다 — 막 들어온 화면에서 작은 뱃지부터 보여 줄 이유가 없다. */
const TOP_ZONE = 24;
/** 손가락 떨림은 방향으로 치지 않는다. */
const DIRECTION_DELTA = 6;

const animate = (toValue: number) =>
  Animated.timing(cartBadgeCollapse, {
    toValue,
    duration: DURATION_MS,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();

/**
 * 스크롤 방향으로 뱃지를 접었다 편다. 돌려주는 것을 스크롤 뷰에 그대로 펼친다.
 *
 * 내리는 동안에는 점으로 줄여 읽던 것을 덜 가리고, 올리면 제 크기로 돌아온다 —
 * 위로 올리는 것은 대개 머리로 돌아가려는 동작이라, 그때 장바구니가 또렷해야 한다.
 *
 * 이어지는 값이 아니라 두 상태 사이를 오간다. 스크롤 양에 비례해 크기를 바꾸면
 * 손가락을 조금 움직일 때마다 뱃지가 계속 떨린다.
 */
export const useCartBadgeScrollCollapse = () => {
  const lastY = useRef(0);
  const collapsed = useRef(false);

  const set = useCallback((next: boolean) => {
    if (collapsed.current === next) return;
    collapsed.current = next;
    animate(next ? 1 : 0);
  }, []);

  // 떠났다 돌아오면 제 크기로 돌려놓는다. 접힌 채 남으면 스크롤한 적도 없는 화면에서
  // 이유 없이 작아진 뱃지를 보게 된다.
  useFocusEffect(
    useCallback(() => {
      lastY.current = 0;
      set(false);
    }, [set]),
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = event.nativeEvent.contentOffset.y;
      const dy = y - lastY.current;
      lastY.current = y;

      if (y <= TOP_ZONE) {
        set(false);
        return;
      }

      if (dy > DIRECTION_DELTA) set(true);
      else if (dy < -DIRECTION_DELTA) set(false);
    },
    [set],
  );

  return { onScroll, scrollEventThrottle: 16 } as const;
};
