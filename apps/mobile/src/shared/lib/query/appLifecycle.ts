import {
  addNetworkStateListener,
  getNetworkStateAsync,
  type NetworkState,
  NetworkStateType,
} from "expo-network";
import { AppState, Platform } from "react-native";

import { focusManager, onlineManager } from "@tanstack/react-query";

/**
 * 연결 없음(NONE)이거나 인터넷에 닿지 않는다고 확정된 경우만 offline 으로 본다.
 * 앱 시작 직후처럼 상태가 아직 UNKNOWN 이면 online 으로 두어 쿼리가 불필요하게 멈추지 않게 한다.
 */
const isOnline = ({ type, isInternetReachable }: NetworkState) =>
  type !== NetworkStateType.NONE && isInternetReachable !== false;

/**
 * RN 에는 window focus / online 이벤트가 없어 react-query 의 기본 감지가 동작하지 않는다.
 * - 앱 포커스: AppState 가 active 로 돌아오면 focus → stale 쿼리를 refetch (refetchOnWindowFocus)
 * - 네트워크: 연결이 복구되면 online → stale 쿼리를 refetch (refetchOnReconnect).
 *   offline 동안 요청은 실패하지 않고 paused 로 기다렸다가 복구 시 이어서 실행된다.
 *
 * setEventListener 는 구독자가 생길 때 연결되고 모두 사라지면 반환한 cleanup 으로 해제된다.
 * web 타깃은 브라우저 이벤트를 쓰는 기본 동작을 그대로 둔다.
 */
export const setupQueryAppLifecycle = () => {
  if (Platform.OS === "web") return;

  focusManager.setEventListener((setFocused) => {
    const subscription = AppState.addEventListener("change", (status) => {
      setFocused(status === "active");
    });
    return () => subscription.remove();
  });

  onlineManager.setEventListener((setOnline) => {
    // addNetworkStateListener 는 "변화" 에만 울린다. onlineManager 는 online=true 로 시작하고
    // setOnline 은 값이 그대로면 아무도 깨우지 않으므로, 오프라인으로 앱을 켜면
    // (1) 쿼리가 paused 가 아니라 그냥 실패하고 (2) 연결이 돌아와도 상태가 "변하지" 않아
    // 재개도 refetch 도 일어나지 않는다. 시작 시점의 실제 상태를 한 번 읽어 seed 한다.
    void getNetworkStateAsync()
      .then((state) => setOnline(isOnline(state)))
      // 상태를 못 읽으면 기본값(online)으로 두는 편이 쿼리를 멈춰 두는 것보다 안전하다.
      .catch(() => undefined);

    const subscription = addNetworkStateListener((state) => {
      setOnline(isOnline(state));
    });
    return () => subscription.remove();
  });
};
