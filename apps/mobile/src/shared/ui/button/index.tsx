import type { StyleProp, ViewStyle } from "react-native";
import { Text } from "react-native";

import { Touchable } from "@shared/ui/press";

/**
 * primary   — 그 화면에서 하려던 일. 채움은 언제나 검정(bg-foreground)이다.
 *             브랜드 주황은 "고른 것·갈 수 있는 곳"만 뜻하도록 두고(wave 1),
 *             주요 동작까지 주황으로 칠하면 어느 색이 "주요"인지 배울 수 없다.
 * secondary — 같은 자리의 다른 선택지. 외곽선만 둔다.
 * onColor   — 앱이 고르지 않은 색 위에 놓이는 버튼(프로모션 끝의 브랜드 대표색 띠).
 *             흰 바탕이라 어떤 브랜드 색 위에서도 읽히고, 옅은 테두리는 띠 색이
 *             흰색에 가까울 때 버튼 모양이 사라지지 않게 한다.
 */
type ButtonVariant = "primary" | "secondary" | "onColor";

/**
 * lg — 화면 하나가 걸린 동작(로그인, 가입, 필터 적용). 입력칸과 같은 56.
 * md — 글 사이에 끼어드는 동작(브랜드 페이지로, 재시도). 44pt 터치 최소치에 맞춘다.
 *
 * 세 번째 "small" 은 두지 않았다. 지금 앱의 버튼은 화면 동작 아니면 줄 안 동작
 * 둘 중 하나고, 44 아래로 내려갈 자리가 없다. 칩은 버튼이 아니라 칩이다.
 */
type ButtonSize = "lg" | "md";

export const BUTTON_HEIGHT: Record<ButtonSize, number> = { lg: 56, md: 44 };

// 모서리는 하나뿐이다 — rounded-full. 로그인·가입만 rounded-lg 였는데,
// 새 사용자가 가장 먼저 보는 두 화면이 나머지 앱과 다른 모양이었다.
const SHAPE = "items-center justify-center rounded-full";

const FILL: Record<ButtonVariant, string> = {
  primary: "bg-foreground",
  secondary: "border-neutral-subtle border",
  onColor: "bg-background border-neutral-subtle border",
};

const LABEL_COLOR: Record<ButtonVariant, string> = {
  primary: "text-background",
  secondary: "text-foreground",
  onColor: "text-foreground",
};

const LABEL_SIZE: Record<ButtonSize, string> = {
  lg: "text-body-2",
  md: "text-body-3",
};

// 비활성은 세 화면이 각자 손으로 넣던 값이다. 한 곳에서만 정한다.
const DISABLED_OPACITY = 0.3;

interface ButtonProps {
  label: string;
  onPress(): void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  /** 자리 잡는 클래스만(폭·바깥 여백). 색·모서리·높이는 이 컴포넌트가 정한다. */
  className?: string;
  /** 폭 고정이나 간격처럼 클래스로 못 쓰는 값. 높이·투명도는 덮어쓰지 않는다. */
  style?: StyleProp<ViewStyle>;
  /** 글자와 읽어 줄 이름이 달라야 할 때만. 기본은 label 그대로다. */
  accessibilityLabel?: string;
}

/** 앱의 모든 버튼. 새 모양이 필요하면 여기에 variant/size 를 늘린다. */
export function Button({
  label,
  onPress,
  variant = "primary",
  size = "lg",
  disabled = false,
  className,
  style,
  accessibilityLabel,
}: ButtonProps) {
  return (
    <Touchable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={`${FILL[variant]} ${SHAPE} ${className ?? ""}`}
      disabled={disabled}
      onPress={onPress}
      style={[
        {
          height: BUTTON_HEIGHT[size],
          opacity: disabled ? DISABLED_OPACITY : 1,
        },
        style,
      ]}
    >
      <Text className={`${LABEL_SIZE[size]} ${LABEL_COLOR[variant]} font-bold`}>
        {label}
      </Text>
    </Touchable>
  );
}
