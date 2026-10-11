import { useEffect, useState } from "react";

import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { create } from "zustand";

import { Touchable } from "@shared/ui/press";

import { HeaderHeight, Spacing } from "@/constants/theme";

/** 스스로 사라지기까지. 한 줄을 읽고 눈을 떼기에 넉넉한 길이다. */
const VISIBLE_MS = 3200;
const FADE_MS = 180;
/** 들고 날 때 미끄러지는 거리. 방향을 알아볼 만큼만 움직인다. */
const SLIDE = 8;
/**
 * 상태바 아래로 내려오는 거리. 화면 머리(52)를 지나 자리를 잡는다 —
 * 머리 막대가 있는 화면에서는 그 바로 밑에, 사진 위에 뒤로가기만 떠 있는
 * 상세 화면(top 8 + 지름 36)에서는 그 버튼 아래에 떨어진다. 어느 쪽이든
 * 돌아갈 길을 가리지 않는다.
 */
const DROP = HeaderHeight + Spacing.tight;

interface ToastState {
  message: string | null;
  /** 같은 글이 잇따라 와도 다시 보이게 하는 번호. */
  seq: number;
  show(message: string): void;
  hide(): void;
}

const useToastStore = create<ToastState>()((set) => ({
  message: null,
  seq: 0,
  show: (message) => set((s) => ({ message, seq: s.seq + 1 })),
  hide: () => set({ message: null }),
}));

/**
 * 한 줄 알림. **묻지 않고 알리기만 할 때** 쓴다 — 하트가 안 눌렸다거나 재고가 모자란다거나.
 *
 * Alert 로 그런 것을 말하면 화면을 막고 탭을 받아야 사라진다. 사용자가 할 일이 없는
 * 소식에 손을 쓰게 만드는 셈이다. 되돌릴 수 없는 일을 **묻는** 자리에는 그대로 Alert 을 쓴다.
 *
 * 컴포넌트 밖에서도 부를 수 있다 — mutation 의 onError 가 주된 호출자다.
 */
export const showToast = (message: string) =>
  useToastStore.getState().show(message);

/**
 * 토스트가 뜨는 자리. 루트에 하나만 둔다.
 *
 * 한 번에 하나만 보여 준다 — 쌓아 올리면 뒤엣것을 읽기 전에 앞엣것이 사라지고,
 * 실패가 연달아 날 때(연타) 화면이 알림으로 덮인다. 새 글이 오면 그것으로 갈아탄다.
 */
export function ToastHost() {
  const insets = useSafeAreaInsets();
  const message = useToastStore((s) => s.message);
  const seq = useToastStore((s) => s.seq);
  const hide = useToastStore((s) => s.hide);
  // BottomSheet 와 같은 꼴이다 — 렌더 중에 ref.current 를 읽지 않기 위해 state 에 둔다.
  const [opacity] = useState(() => new Animated.Value(0));
  // 위에서 내려와 앉고, 사라질 때 같은 길로 올라간다. 투명도 하나가 둘 다 몬다.
  const slide = opacity.interpolate({
    inputRange: [0, 1],
    outputRange: [-SLIDE, 0],
  });

  useEffect(() => {
    if (!message) return undefined;

    // 낭독기는 화면에 뜬 것을 저절로 읽지 않는다. 글이 바뀔 때마다 알린다.
    AccessibilityInfo.announceForAccessibility(message);

    Animated.timing(opacity, {
      toValue: 1,
      duration: FADE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) hide();
      });
    }, VISIBLE_MS);

    return () => clearTimeout(timer);
    // seq 는 같은 글이 다시 와도 타이머를 새로 걸기 위한 것이다.
  }, [message, seq, opacity, hide]);

  if (!message) return null;

  return (
    <Animated.View
      // 뒤에 있는 것을 가리지 않는다 — 글 상자만 손가락을 받는다.
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: Spacing.tight,
        right: Spacing.tight,
        top: insets.top + DROP,
        opacity,
        transform: [{ translateY: slide }],
      }}
    >
      <Touchable
        accessibilityLabel={message}
        accessibilityLiveRegion={Platform.OS === "android" ? "polite" : "none"}
        accessibilityRole="alert"
        // 읽고 나면 바로 치울 수 있게 한다. 기다려야만 사라지면 그것도 막는 것이다.
        className="bg-foreground rounded-lg px-4 py-3"
        feedback="none"
        onPress={hide}
      >
        <Text className="text-body-3 text-background">{message}</Text>
      </Touchable>
    </Animated.View>
  );
}
