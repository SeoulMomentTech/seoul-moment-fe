import { Fragment, useEffect, useState, type ReactNode } from "react";

import {
  Animated,
  Easing,
  Modal,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { Touchable } from "@shared/ui/press";

const SHEET_MAX_HEIGHT = "85%";
const SHEET_ANIMATION_MS = 250;

interface BottomSheetProps {
  visible: boolean;
  title: string;
  onClose(): void;
  children: ReactNode;
}

/**
 * 바텀 시트 라이브러리가 없어서 Modal 로 만든다.
 * animationType="slide" 는 딤 배경까지 같이 밀어 올려서, Modal 은 애니메이션 없이 두고
 * 배경(opacity)과 패널(translateY)을 Animated 로 따로 움직인다.
 *
 * - visible: 호출자가 원하는 열림 상태.
 * - shown: Modal 이 실제로 화면에 올라온 뒤(onShow)부터 닫힘 애니메이션이 끝날 때까지 true.
 *   Modal 의 visible 은 `visible || shown` 이라, 닫힘 애니메이션이 끝나기 전에는 내려가지 않는다.
 * - children 은 Modal 이 보이는 동안만 마운트된다. 닫히는 도중 다시 열리면 Modal 이 그대로
 *   떠 있어서 children 이 유지되므로, session 키를 바꿔 내부 상태를 새로 시드한다.
 *
 * 상품 필터·정렬 시트와 계정 화면의 보기 목록이 같은 것을 쓴다.
 */
export function BottomSheet({
  visible,
  title,
  onClose,
  children,
}: BottomSheetProps) {
  const { height: windowHeight } = useWindowDimensions();
  const [shown, setShown] = useState(false);
  const [session, setSession] = useState(0);
  const [prevVisible, setPrevVisible] = useState(visible);
  // 0: 닫힘(배경 투명, 패널은 화면 아래) / 1: 열림(배경 불투명, 패널 제자리)
  const [progress] = useState(() => new Animated.Value(0));

  // 열릴 때마다 키를 올린다(effect 에서 setState 하지 않기 위해 렌더 중에 처리).
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) setSession((s) => s + 1);
  }

  // 열림 애니메이션은 반드시 Modal 이 올라온 뒤(shown)에만 시작한다.
  // visible 이 바뀌는 시점의 effect 는 Modal 의 네이티브 뷰가 생기기 전에 돌아서,
  // 네이티브 드라이버 애니메이션이 아직 없는 뷰에 걸려 progress 가 0 에서 움직이지 않았다
  // (시트는 마운트됐지만 배경 투명 + 패널이 화면 밖인 채로 보이지 않았다).
  // 그래서 onShow 에서 shown 을 켜고, 이 effect 가 그 뒤에 애니메이션을 시작한다.
  // 닫힘이나 닫히는 도중의 재열림도 같은 effect 가 현재 값에서 이어서 처리한다.
  useEffect(() => {
    if (!shown) return;
    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: SHEET_ANIMATION_MS,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    // 중간에 stop 되면 finished 가 false 라서, 다시 열린 시트를 내리지 않는다.
    animation.start(({ finished }) => {
      if (finished && !visible) setShown(false);
    });
    return () => animation.stop();
  }, [visible, shown, progress]);

  // 패널 높이는 화면의 85% 이하라서 windowHeight 만큼 내리면 항상 화면 밖이다.
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [windowHeight, 0],
  });

  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      onShow={() => setShown(true)}
      transparent
      visible={visible || shown}
    >
      <View className="flex-1 justify-end">
        <Animated.View
          // 딤 처리용 반투명 검정. 위치는 고정하고 opacity 만 바뀐다.
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            opacity: progress,
          }}
        >
          <Touchable
            accessibilityLabel="Close"
            accessibilityRole="button"
            // 보이는 면이 없는 터치 영역이다. 투명도를 주면 뒤 배경 자체가 깜빡인다.
            feedback="none"
            onPress={onClose}
            style={{ flex: 1 }}
          />
        </Animated.View>
        <Animated.View
          className="bg-background"
          style={{
            maxHeight: SHEET_MAX_HEIGHT,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            transform: [{ translateY }],
          }}
        >
          <View className="flex-row items-center justify-between px-5 py-4">
            <Text className="text-title-4 text-foreground font-bold">
              {title}
            </Text>
            <Touchable
              accessibilityLabel="Close"
              accessibilityRole="button"
              // 글리프 한 줄(22pt)이라 8 로는 38pt 에 그친다. 14 로 50pt 를 만든다.
              hitSlop={14}
              onPress={onClose}
            >
              <Text className="text-body-1 text-neutral">✕</Text>
            </Touchable>
          </View>
          <Fragment key={session}>{children}</Fragment>
        </Animated.View>
      </View>
    </Modal>
  );
}
