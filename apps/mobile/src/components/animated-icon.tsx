import { useState } from "react";

import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, Keyframe } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const DURATION = 600;

export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: {
      transform: [{ scale: 1 }],
      opacity: 1,
    },
    20: {
      opacity: 1,
    },
    70: {
      opacity: 0,
      easing: Easing.elastic(0.7),
    },
    100: {
      opacity: 0,
      transform: [{ scale: 1 }],
      easing: Easing.elastic(0.7),
    },
  });

  // 네이티브 스플래시(app.json expo-splash-screen)와 같은 배경·같은 로고·같은 폭이라
  // 네이티브에서 이 오버레이로 넘어가는 순간이 보이지 않는다. 둘 중 하나만 바꾸면 깜빡인다.
  const image = (
    <Image
      contentFit="contain"
      source={require("@/assets/images/logo.png")}
      style={styles.image}
    />
  );

  return animate ? (
    <Animated.View
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        "worklet";
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.splashOverlay}
    >
      {image}
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }}
      style={styles.splashOverlay}
    >
      {image}
    </View>
  );
}

const styles = StyleSheet.create({
  // logo.png 는 533x65 워드마크다. 네이티브 스플래시의 imageWidth(200)와 같은 폭으로 맞춘다.
  image: {
    width: 200,
    height: 24,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    // --neutral-0. app.json 의 스플래시 backgroundColor 와 같아야 한다.
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
});
