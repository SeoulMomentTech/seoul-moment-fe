import { useEffect } from "react";

import { Animated, Easing, type DimensionValue } from "react-native";

const PULSE_MS = 800;
const PULSE_LOW = 0.45;

// 모든 Shimmer 가 값 하나를 같이 쓴다. 블록마다 루프를 따로 돌리면 시작 시점이 달라 깜빡임이
// 어긋나고, 화면에 수십 개가 깔리면 애니메이션도 그만큼 늘어난다.
const pulse = new Animated.Value(1);
let subscribers = 0;
let loop: Animated.CompositeAnimation | null = null;

function acquire() {
  subscribers += 1;
  if (subscribers > 1) return;
  // 마운트 이후(effect)에 시작한다. 뷰가 생기기 전에 네이티브 드라이버 애니메이션을 시작하면
  // 값이 움직이지 않는 경우가 있었다.
  pulse.setValue(1);
  loop = Animated.loop(
    Animated.sequence([
      Animated.timing(pulse, {
        toValue: PULSE_LOW,
        duration: PULSE_MS,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(pulse, {
        toValue: 1,
        duration: PULSE_MS,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]),
  );
  loop.start();
}

function release() {
  subscribers -= 1;
  if (subscribers > 0) return;
  // 마지막 블록이 사라지면 루프를 멈춘다. 안 멈추면 화면에 없는데도 계속 돈다.
  loop?.stop();
  loop = null;
}

interface ShimmerProps {
  width?: DimensionValue;
  /** aspectRatio 를 주면 생략할 수 있다(폭에서 높이가 정해진다). */
  height?: number;
  aspectRatio?: number;
  /** 기본 8. 원형이면 height / 2 이상을 준다. */
  radius?: number;
}

/**
 * 모든 스켈레톤의 기본 블록. 색은 bg-neutral-subtle 로 고정하고 opacity 만 오가게 한다.
 * 네이티브 드라이버는 opacity/transform 만 지원해서 backgroundColor 나 width 는 애니메이션하지 않는다.
 */
export function Shimmer({
  width = "100%",
  height,
  aspectRatio,
  radius = 8,
}: ShimmerProps) {
  useEffect(() => {
    acquire();
    return release;
  }, []);

  return (
    <Animated.View
      className="bg-neutral-subtle"
      style={{
        width,
        height,
        aspectRatio,
        borderRadius: radius,
        opacity: pulse,
      }}
    />
  );
}
