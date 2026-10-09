import { ScrollView } from "react-native";

import { Chip, CHIP_GAP } from "@shared/ui/chip";

export interface ChipOption {
  /** 서버에 저장되는 값. */
  value: string;
  /** 칩에 적히는 말. 값과 같을 수도 있다(사이즈), 다를 수도 있다(성별). */
  label: string;
}

/** 값과 보이는 말이 같은 보기들(사이즈 토큰)을 칩 보기로 바꾼다. */
export const toChipOptions = (values: readonly string[]): ChipOption[] =>
  values.map((value) => ({ value, label: value }));

interface ChipRowProps {
  options: readonly ChipOption[];
  /** 고른 값. 없으면 아무것도 채워지지 않는다. */
  value?: string;
  /** 고른 것을 다시 누르면 undefined 가 온다 — 비우는 길이 따로 없으면 되돌릴 수 없다. */
  onChange(next: string | undefined): void;
  /** 화면 낭독기가 이 줄을 무엇이라 부를지. 보통 바로 위 라벨과 같은 말을 준다. */
  accessibilityLabel: string;
}

/**
 * 짧은 보기 중 하나를 고르는 한 줄. 상품 목록 위 카테고리 줄과 같은 물건이다 —
 * 칩을 가로로 늘어놓고, 넘치면 그 줄 안에서 가로로 스크롤한다.
 *
 * 줄 높이가 칩 하나(35)로 고정되는 것이 핵심이다. flex-wrap 으로 접으면 화면 폭과
 * 보기 개수에 따라 줄 수가 달라져, 아래 칸들이 기기마다 다른 자리에 놓이고
 * 로딩 스켈레톤이 실제 높이를 맞출 수 없다.
 *
 * flexGrow: 0 이 없으면 세로 스크롤 안에서 가로 스크롤이 남은 높이를 다 먹는다.
 */
export function ChipRow({
  options,
  value,
  onChange,
  accessibilityLabel,
}: ChipRowProps) {
  return (
    <ScrollView
      accessibilityLabel={accessibilityLabel}
      contentContainerStyle={{ gap: CHIP_GAP }}
      horizontal
      keyboardShouldPersistTaps="handled"
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
    >
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          onPress={() =>
            onChange(option.value === value ? undefined : option.value)
          }
          selected={option.value === value}
        />
      ))}
    </ScrollView>
  );
}
