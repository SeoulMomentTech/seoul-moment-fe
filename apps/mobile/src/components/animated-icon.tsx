import { useState } from "react";

import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, { Easing, Keyframe } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const INITIAL_SCALE_FACTOR = Dimensions.get("screen").height / 90;
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

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: INITIAL_SCALE_FACTOR }],
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
  },
  40: {
    transform: [{ scale: 1.3 }],
    opacity: 0,
    easing: Easing.elastic(0.7),
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }],
    easing: Easing.elastic(0.7),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: "0deg" }],
  },
  100: {
    transform: [{ rotateZ: "7200deg" }],
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View
        entering={glowKeyframe.duration(60 * 1000 * 4)}
        style={styles.glow}
      >
        <Image
          source={require("@/assets/images/logo-glow.png")}
          style={styles.glow}
        />
      </Animated.View>

      <Animated.View
        entering={keyframe.duration(DURATION)}
        style={styles.background}
      />
      <Animated.View
        entering={logoKeyframe.duration(DURATION)}
        style={styles.imageContainer}
      >
        <Image
          source={require("@/assets/images/expo-logo.png")}
          style={styles.image}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  glow: {
    width: 201,
    height: 201,
    position: "absolute",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 128,
    height: 128,
    zIndex: 100,
  },
  // logo.png 는 533x65 워드마크다. 네이티브 스플래시의 imageWidth(200)와 같은 폭으로 맞춘다.
  image: {
    width: 200,
    height: 24,
  },
  background: {
    borderRadius: 40,
    experimental_backgroundImage: `linear-gradient(180deg, #3C9FFE, #0274DF)`,
    width: 128,
    height: 128,
    position: "absolute",
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
