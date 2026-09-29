import {
  addNetworkStateListener,
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
    const subscription = addNetworkStateListener((state) => {
      setOnline(isOnline(state));
    });
    return () => subscription.remove();
  });
};
