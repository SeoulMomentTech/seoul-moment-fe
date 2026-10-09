import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Touchable } from "@shared/ui/press";

import { HeaderHeight } from "@/constants/theme";

interface ScreenHeaderProps {
  /**
   * 머리에 적을 이름. 약관처럼 본문이 제목을 다시 말하지 않는 화면만 준다.
   * 폼 화면들은 본문 맨 위에 title-3 제목을 두므로 여기는 비운다 —
   * 같은 말이 12pt 떨어져 두 번 적히면 둘 중 어느 것이 제목인지 알 수 없다.
   */
  title?: string;
}

/**
 * 사진 없는 화면의 머리. 상태바 아래 52pt 막대에 뒤로가기 하나,
 * 그리고 언제나 아래 테두리 — 하나만 테두리가 없으면 그 화면만 떠 있는 것처럼 보인다.
 *
 * 약관·계정 화면이 같은 것을 쓴다. 새 화면이 또 손으로 그리기 전에 여기로 온다.
 */
export function ScreenHeader({ title }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      className="border-neutral-subtle border-b"
      style={{ paddingTop: insets.top }}
    >
      <View
        className="flex-row items-center px-5"
        style={{ height: HeaderHeight }}
      >
        <Touchable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          // 글리프 한 줄(24pt)이라 14 로 넓혀 44pt 터치 영역을 넘긴다.
          hitSlop={14}
          onPress={() => router.back()}
        >
          <Text className="text-title-4 text-foreground font-bold">‹</Text>
        </Touchable>
        {title ? (
          <Text
            className="text-body-2 text-foreground ml-3 flex-1 font-bold"
            numberOfLines={1}
          >
            {title}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
