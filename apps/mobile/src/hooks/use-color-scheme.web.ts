import { useSyncExternalStore } from "react";

import { useColorScheme as useRNColorScheme } from "react-native";

const subscribe = () => () => {};

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  // 서버 스냅샷은 false, 클라이언트 스냅샷은 true — effect 안 setState 없이 하이드레이션 여부를 얻는다.
  const hasHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return "light";
}
