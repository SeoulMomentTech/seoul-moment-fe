import { AppState } from "react-native";
import { create } from "zustand";

import { getDeviceLanguage, type LanguageType } from "./language";

/**
 * 지금 쓰는 언어. **앱에 하나만 둔다.**
 *
 * 전에는 이 훅이 제각기 useState 와 AppState 구독을 들었다. 쿼리 훅 몇 곳에서만 부를 때는
 * 그래도 됐지만, 이제 화면 문구가 전부 useTranslations 를 거치므로 목록의 행 하나하나까지
 * 이 훅을 부른다 — 행이 뜰 때마다 네이티브 getLocales() 를 다시 묻고 구독을 새로 다는 꼴이라,
 * 스크롤 한 번에 구독이 수백 개로 불어난다.
 *
 * 그래서 값은 모듈에 하나만 두고, 구독도 하나만 둔다. 읽는 쪽은 그 값을 볼 뿐이다.
 */
const useLanguageStore = create<{ language: LanguageType }>(() => ({
  language: getDeviceLanguage(),
}));

/**
 * 기기 언어는 앱이 떠 있는 동안 바뀌지 않지만, 사용자가 설정에서 바꾸고 돌아오면 달라진다.
 * 포그라운드로 돌아올 때 한 번 다시 보고, 달라졌을 때만 쓴다 — 같은 값을 다시 쓰면
 * 화면 전체가 공연히 다시 그려진다.
 *
 * 리스너는 앱이 사는 동안 그대로 산다. 떼어 낼 자리가 없고, 떼어 낼 이유도 없다.
 */
AppState.addEventListener("change", (status) => {
  if (status !== "active") return;

  const next = getDeviceLanguage();
  if (next !== useLanguageStore.getState().language) {
    useLanguageStore.setState({ language: next });
  }
});

export const useLanguage = (): LanguageType =>
  useLanguageStore((state) => state.language);
