import type { ReactNode } from "react";

import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

// 스크림은 상태바 영역(insets.top) 아래로 이만큼 더 내려와 옅어진다.
export const SCRIM_EXTRA_HEIGHT = 64;
// 떠 있는 뒤로가기 버튼(top 8 + 지름 36) 아래로 상태 화면 내용을 내린다.
const BACK_BUTTON_CLEARANCE = 52;

export function BackButton() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      accessibilityLabel="Go back"
      accessibilityRole="button"
      className="absolute left-5 h-9 w-9 items-center justify-center rounded-full"
      hitSlop={8}
      onPress={() => router.back()}
      // 배너 사진 위에 떠야 하므로 반투명 검정을 직접 쓴다. 토큰에는 오버레이 색이 없다.
      style={{ top: insets.top + 8, backgroundColor: "rgba(0,0,0,0.45)" }}
    >
      {/* 어두운 원 위의 글리프라 토큰 대신 흰색을 직접 쓴다. */}
      <Text className="text-title-4 font-bold" style={{ color: "#FFFFFF" }}>
        ‹
      </Text>
    </Pressable>
  );
}

/**
 * 화면 상단에 고정되는 스크림. 밝은 사진 위에서도 상태바 글리프와 뒤로가기 버튼이
 * 보이도록 위에서 아래로 옅어지는 검정 그라디언트를 SVG 로 그린다.
 */
export function TopScrim({ height }: { height: number }) {
  return (
    <Svg
      height={height}
      pointerEvents="none"
      style={{ position: "absolute", top: 0, left: 0, right: 0 }}
      width="100%"
    >
      <Defs>
        <LinearGradient id="scrim" x1="0" x2="0" y1="0" y2="1">
          {/* className 을 받지 못하는 SVG 라 스톱 색을 직접 쓴다. 맨 위 0.5 는 밝은 사진에서도 글리프가 읽히는 값. */}
          <Stop offset="0" stopColor="#000000" stopOpacity={0.5} />
          {/* 중간 스톱으로 띠 경계가 도드라지지 않게 부드럽게 줄인다. */}
          <Stop offset="0.5" stopColor="#000000" stopOpacity={0.2} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect fill="url(#scrim)" height={height} width="100%" x={0} y={0} />
    </Svg>
  );
}

/**
 * 콘텐츠가 없는 상태(잘못된 id, 오프라인, 에러) 공통 틀.
 * 흰 배경이라 스크림 없이 어두운 상태바 글리프를 쓰고, 뒤로가기 버튼은 항상 둔다.
 * 로딩은 여기에 담지 않는다 — 스켈레톤 배너가 실제 배너처럼 상태바 밑까지 올라가야 해서
 * 이 상단 패딩이 오히려 높이를 어긋나게 한다.
 */
export function StatusScreen({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-background flex-1">
      <StatusBar style="dark" />
      <BackButton />
      <View style={{ paddingTop: insets.top + BACK_BUTTON_CLEARANCE }}>
        {children}
      </View>
    </View>
  );
}
