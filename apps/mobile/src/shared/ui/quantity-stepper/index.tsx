import { Text, View } from "react-native";

import { Touchable } from "@shared/ui/press";

/**
 * 스테퍼 높이이자 양 끝 단추의 한 변. 44 는 터치의 바닥이라 더 줄이지 않는다 —
 * 두 단추가 8pt 떨어져 붙어 있는 컨트롤이라 하나라도 작아지면 옆 것을 누르게 된다.
 */
export const STEPPER_HEIGHT = 44;

/** 숫자 자리. 두 자리(99)까지 폭이 흔들리지 않을 만큼만 잡는다. */
const VALUE_WIDTH = 40;

/** 알약 전체의 폭. 스켈레톤(shapes.tsx)이 같은 값을 써야 줄 안에서 자리가 어긋나지 않는다. */
export const STEPPER_WIDTH = 2 * STEPPER_HEIGHT + VALUE_WIDTH;

// 비활성 투명도. 공용 Button 과 같은 값이다 — 한 화면에서 흐려지는 정도가 달라 보이면 안 된다.
const DISABLED_OPACITY = 0.3;

interface StepButtonProps {
  glyph: string;
  accessibilityLabel: string;
  disabled: boolean;
  onPress(): void;
}

function StepButton({
  glyph,
  accessibilityLabel,
  disabled,
  onPress,
}: StepButtonProps) {
  return (
    <Touchable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className="items-center justify-center"
      disabled={disabled}
      onPress={onPress}
      style={{
        width: STEPPER_HEIGHT,
        height: STEPPER_HEIGHT,
        opacity: disabled ? DISABLED_OPACITY : 1,
      }}
    >
      <Text className="text-body-2 text-foreground font-bold">{glyph}</Text>
    </Touchable>
  );
}

interface QuantityStepperProps {
  value: number;
  /** 고를 수 있는 최대 수량. 호출부가 재고와 정책 천장 중 작은 쪽을 넘긴다. */
  max: number;
  onChange(next: number): void;
  /** 보내는 중이거나 살 수 없는 줄. 양 끝이 모두 잠긴다. */
  disabled?: boolean;
  /** 읽어 줄 대상의 이름. "Increase quantity of <label>" 로 붙는다. */
  label: string;
}

/**
 * 수량 하나를 올리고 내리는 알약. 바닥은 언제나 1 이다 — 0 은 "지움"이고, 지우는 것은
 * 줄 오른쪽의 제 단추가 따로 맡는다. 수량을 0 으로 내려 사라지게 하면 되돌릴 수 없는 일이
 * 실수로 일어난다.
 *
 * 천장은 호출부가 정한다(장바구니에서는 재고와 99 중 작은 쪽). 천장에 닿으면 + 가 흐려진다 —
 * 누를 수는 있는데 아무 일도 안 일어나는 것보다 낫다.
 */
export function QuantityStepper({
  value,
  max,
  onChange,
  disabled = false,
  label,
}: QuantityStepperProps) {
  const canDecrease = !disabled && value > 1;
  const canIncrease = !disabled && value < max;

  return (
    <View
      accessibilityLabel={`Quantity of ${label}`}
      accessibilityValue={{ now: value, min: 1, max }}
      className="border-neutral-subtle flex-row items-center self-start rounded-full border"
      style={{ height: STEPPER_HEIGHT }}
    >
      <StepButton
        accessibilityLabel={`Decrease quantity of ${label}`}
        disabled={!canDecrease}
        glyph="−"
        onPress={() => onChange(value - 1)}
      />
      <Text
        className="text-body-2 text-foreground text-center font-bold"
        style={{ width: VALUE_WIDTH }}
      >
        {value}
      </Text>
      <StepButton
        accessibilityLabel={`Increase quantity of ${label}`}
        disabled={!canIncrease}
        glyph="+"
        onPress={() => onChange(value + 1)}
      />
    </View>
  );
}
