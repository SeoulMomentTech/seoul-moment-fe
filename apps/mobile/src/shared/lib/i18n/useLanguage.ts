import { AppState } from "react-native";
import { create } from "zustand";

import { getDeviceLanguage, type LanguageType } from "./language";
import { languageStorage } from "./languageStorage";

interface LanguageState {
  /** 사용자가 고른 것. 고른 적이 없으면 null 이다. */
  chosen: LanguageType | null;
  /** 기기 설정에서 읽은 것. 고른 것이 없을 때 쓰인다. */
  device: LanguageType;
}

/**
 * 지금 쓰는 언어. **앱에 하나만 둔다.**
 *
 * 전에는 이 훅이 제각기 useState 와 AppState 구독을 들었다. 쿼리 훅 몇 곳에서만 부를 때는
 * 그래도 됐지만, 이제 화면 문구가 전부 useTranslations 를 거치므로 목록의 행 하나하나까지
 * 이 훅을 부른다 — 행이 뜰 때마다 네이티브 getLocales() 를 다시 묻고 구독을 새로 다는 꼴이라,
 * 스크롤 한 번에 구독이 수백 개로 불어난다.
 *
 * 그래서 값은 모듈에 하나만 두고, 구독도 하나만 둔다. 읽는 쪽은 그 값을 볼 뿐이다.
 *
 * 고른 것과 기기 것을 따로 들고 있는 이유: 고른 적 없는 사람은 기기를 따라가야 하고,
 * 한 번 고른 사람은 기기를 바꿔도 고른 것이 남아야 한다. 하나로 합치면 둘 중 하나를 잃는다.
 */
const useLanguageStore = create<LanguageState>(() => ({
  chosen: languageStorage.load(),
  device: getDeviceLanguage(),
}));

/**
 * 기기 언어는 앱이 떠 있는 동안 바뀌지 않지만, 사용자가 설정에서 바꾸고 돌아오면 달라진다.
 * 포그라운드로 돌아올 때 한 번 다시 보고, 달라졌을 때만 쓴다 — 같은 값을 다시 쓰면
 * 화면 전체가 공연히 다시 그려진다. 고른 것이 있으면 이 값은 쓰이지 않지만, 그래도
 * 최신으로 둔다 — 나중에 고른 것을 지울 길이 생겨도 옛 값이 되살아나지 않게.
 *
 * 리스너는 앱이 사는 동안 그대로 산다. 떼어 낼 자리가 없고, 떼어 낼 이유도 없다.
 */
AppState.addEventListener("change", (status) => {
  if (status !== "active") return;

  const device = getDeviceLanguage();
  if (device !== useLanguageStore.getState().device) {
    useLanguageStore.setState({ device });
  }
});

export const useLanguage = (): LanguageType =>
  useLanguageStore((state) => state.chosen ?? state.device);

/**
 * 언어를 고른다. 이 값은 기기 설정을 덮고, 다시 고르기 전까지 남는다.
 *
 * 화면 문구만 바뀌는 것이 아니다 — 쿼리 키에 언어가 들어 있어 상품·뉴스도 새 언어로
 * 다시 받아진다. 그래서 캐시를 손으로 비우지 않는다.
 */
export const setLanguage = (language: LanguageType) => {
  if (useLanguageStore.getState().chosen === language) return;

  languageStorage.save(language);
  useLanguageStore.setState({ chosen: language });
};
