import { Text } from "react-native";

import { Touchable } from "@shared/ui/press";

/**
 * 칩 사이 간격. 목록 위 카테고리 줄과 필터 시트가 같은 값을 쓴다 —
 * Spacing 의 네 값(12/24/40/64)은 블록 사이 리듬이고, 칩끼리의 8 은 그보다 아래 단위다.
 * 스켈레톤(shapes.tsx 의 CHIP_GAP)도 같은 값이어야 줄 길이가 어긋나지 않는다.
 */
export const CHIP_GAP = 8;

interface ChipProps {
  label: string;
  selected: boolean;
  onPress(): void;
}

/**
 * 고르는 알약 하나. 상품 목록 위 카테고리 줄과 마이페이지 관심 상품 필터가 같이 쓴다 —
 * "고르는 것"은 앱 어디서나 같은 생김새를 가진다.
 *
 * 전에는 web 처럼 동그란 사진 썸네일이었다. 사진은 라벨이 이미 말한 것 외에 아무것도
 * 더하지 않았고, 폭이 고정이라 이름 대부분이 잘렸다. 여기에 그 원을 다시 들이지 않는다.
 *
 * 선택은 테두리 두께가 아니라 채움으로 나타낸다. border-2 로 바꾸면 상자가 가로·세로로
 * 2pt 씩 커져 오른쪽 칩들이 전부 밀리고 스켈레톤(CHIP_HEIGHT=35)과도 어긋난다.
 * 글자 굵기도 그대로 둬야 글자 폭이 안 변한다 — 대비는 bg-brand 가 충분히 준다.
 */
export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Touchable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={
        selected
          ? "bg-brand border-brand rounded-full border px-4 py-2"
          : "border-neutral-subtle rounded-full border px-4 py-2"
      }
      // 칩 높이가 35pt 라 위아래로 5pt 씩 넓혀 44pt 최소 터치 영역을 맞춘다.
      // 칩 사이 간격이 8pt 뿐이라 좌우는 넓히지 않는다.
      hitSlop={{ top: 5, bottom: 5 }}
      onPress={onPress}
    >
      <Text
        className={
          selected
            ? "text-body-3 text-background"
            : "text-body-3 text-foreground"
        }
      >
        {label}
      </Text>
    </Touchable>
  );
}
