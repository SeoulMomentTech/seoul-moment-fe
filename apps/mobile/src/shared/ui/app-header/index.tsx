import { Image } from "expo-image";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

import { HeaderHeight } from "@/constants/theme";

// className 을 받지 못하는 SVG 라 nativewind --foreground 토큰 값을 직접 쓴다.
const FOREGROUND = "#171717";

/**
 * 모든 탭이 공유하는 앱 헤더. 상단 safe-area inset 을 이 컴포넌트가 소유한다.
 */
export function AppHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-background border-neutral-subtle border-b"
      style={{ paddingTop: insets.top }}
    >
      <View
        className="flex-row items-center justify-between px-5"
        style={{ height: HeaderHeight }}
      >
        <Image
          accessibilityLabel="Seoul Moment"
          contentFit="contain"
          source={require("@/assets/images/logo.png")}
          style={{ width: 164, height: 20 }}
        />
        {/* TODO: 장바구니 라우트가 생기면 Pressable 로 바꾼다. 지금은 표시만 하는 아이콘이다. */}
        <View>
          <Svg fill="none" height={22} viewBox="0 0 24 24" width={22}>
            <Circle cx={9} cy={21} fill={FOREGROUND} r={1} />
            <Circle cx={20} cy={21} fill={FOREGROUND} r={1} />
            <Path
              d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
              stroke={FOREGROUND}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </Svg>
        </View>
      </View>
    </View>
  );
}
