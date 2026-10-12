import { Text } from "react-native";

import { Touchable } from "@shared/ui/press";

// 줄 높이. 44 는 터치의 바닥이지 디자인이 아니다 — 두 줄짜리 화면에서 56 은 쪼그라들어
// 보인다. body-2 라벨 한 줄(19)을 위아래 22 로 감싸 64 로 둔다.
export const MENU_ROW_HEIGHT = 64;

interface MenuRowProps {
  label: string;
  /**
   * 라벨 오른쪽, 꺾쇠 앞에 적히는 지금 값. 누르면 바뀌는 설정 줄에만 준다 —
   * 다른 화면으로 가기만 하는 줄은 보여 줄 "지금 값"이 없다.
   */
  value?: string;
  onPress(): void;
}

/**
 * 마이페이지 메뉴의 한 줄. 가는 줄과 고치는 줄이 같은 모양을 쓴다 —
 * 둘을 다르게 그리면 같은 목록 안에서 줄마다 높이와 여백이 달라진다.
 */
export function MenuRow({ label, value, onPress }: MenuRowProps) {
  return (
    <Touchable
      // 값이 있으면 그것까지 읽어 준다 — "언어" 만 읽으면 지금 무엇인지 알 수 없다.
      accessibilityLabel={value ? `${label}, ${value}` : label}
      accessibilityRole="button"
      // 줄 사이 선은 줄의 위에 긋는다. 아래에 그으면 마지막 줄 밑에 아무것도 없는
      // 선이 남는다. 첫 줄의 윗선이 위 블록과 메뉴를 가르는 선을 겸한다.
      className="border-neutral-subtle flex-row items-center justify-between border-t px-5"
      onPress={onPress}
      style={{ height: MENU_ROW_HEIGHT }}
    >
      <Text className="text-body-2 text-foreground">{label}</Text>
      <Text className="text-body-1 text-neutral">
        {value ? (
          <Text className="text-body-2 text-neutral">{value} </Text>
        ) : null}
        ›
      </Text>
    </Touchable>
  );
}
