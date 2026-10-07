import { useState, type ComponentProps } from "react";

import { Platform, Pressable } from "react-native";

/**
 * 누름 피드백의 세기. 호출부는 "무엇 위에 놓였는가"만 고르고, 플랫폼별 수단
 * (iOS 투명도 / Android 리플)은 이 파일 한 곳에서 정한다.
 *
 * - surface: 흰 면 위의 줄·버튼·칩·텍스트 링크. 대부분이 여기에 해당한다.
 * - card: 면적 대부분이 사진인 카드. 사진 위 리플은 번져 보이기만 해서 쓰지 않고,
 *   사진이 죽지 않게 투명도도 얕게 준다.
 * - overlay: 사진 위에 떠 있는 컨트롤(떠 있는 뒤로가기, 어두운 띠 안의 재시도).
 *   흰 면이 아니라 검정 리플이 보이지 않으므로 흰 리플을 쓴다.
 * - none: 보이는 면이 없는 터치 영역(시트 뒤 배경). 피드백이 없는 것이 의도임을 밝힌다.
 */
export type PressFeedback = "surface" | "card" | "overlay" | "none";

// android_ripple 은 className 을 받지 못하는 네이티브 prop 이라 토큰 값을 직접 쓴다.
const RIPPLE: Record<
  PressFeedback,
  { color: string; borderless?: boolean } | null
> = {
  // --neutral-900 (#171717) 8%
  surface: { color: "rgba(23,23,23,0.08)" },
  card: null,
  // --neutral-0 (#ffffff) 24%
  overlay: { color: "rgba(255,255,255,0.24)", borderless: true },
  none: null,
};

// 눌린 동안의 투명도. Android 에서 리플이 있는 톤은 투명도를 겹치지 않는다 —
// 면 전체가 깜빡여 Material 의 "눌린 지점에서 번진다"와 어긋난다.
const PRESSED_OPACITY: Record<PressFeedback, number> = {
  surface: 0.6,
  card: 0.85,
  overlay: 0.7,
  none: 1,
};

const pressedOpacity = (feedback: PressFeedback, pressed: boolean) => {
  if (!pressed) return 1;
  if (Platform.OS === "android" && RIPPLE[feedback] != null) return 1;
  return PRESSED_OPACITY[feedback];
};

type TouchableProps = ComponentProps<typeof Pressable> & {
  feedback?: PressFeedback;
};

/**
 * 앱의 모든 누를 수 있는 것은 이 래퍼를 쓴다. Pressable 을 직접 쓰면 눌러도
 * 화면이 바뀔 때까지 아무 일도 일어나지 않아 고장난 것처럼 보인다.
 *
 * 눌림 상태를 Pressable 의 함수형 style 대신 state 로 들고 있는 이유:
 * nativewind 는 className 으로 만든 스타일을 inline style 과 병합하는데
 * (react-native-css 의 deepMergeConfig / flattenStyleArray) 그 경로가 배열·객체만
 * 다루고 함수는 못 다룬다. 함수를 넘기면 className 은 그대로 먹지만 style 이 통째로
 * 버려져, 높이를 style 로 주는 버튼·메뉴 줄이 글자 높이로 쪼그라든다.
 */
export function Touchable({
  feedback = "surface",
  style,
  onPressIn,
  onPressOut,
  ...props
}: TouchableProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      {...props}
      android_ripple={RIPPLE[feedback]}
      onPressIn={(event) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      style={[
        { opacity: pressedOpacity(feedback, pressed) },
        // 호출부가 함수형을 쓰면 여기서 풀어 배열로 넘긴다 — 위 이유로 함수는 통과시키지 않는다.
        typeof style === "function"
          ? style({ pressed, hovered: false })
          : style,
      ]}
    />
  );
}
