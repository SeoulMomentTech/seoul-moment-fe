import * as SecureStore from "expo-secure-store";

import { LANGUAGES, type LanguageType } from "./language";

const KEY = "app.language";

/**
 * 사용자가 고른 언어. 고른 적이 없으면 null 이고, 그때는 기기 언어를 따른다.
 *
 * 비밀이 아닌데 SecureStore 에 두는 것은 앱에 다른 저장소가 없어서다 — AsyncStorage 를
 * 들이면 네이티브 의존이 하나 늘어 dev build 를 다시 구워야 하는데, 두 글자짜리 값
 * 하나를 두려고 치를 값이 아니다. 토큰을 읽느라 어차피 뜨는 Keystore 에 얹는 셈이다.
 *
 * **동기 API 를 쓴다.** 첫 프레임이 그려지기 전에 값을 알아야 한다 — 나중에 읽어서
 * 갈아끼우면 화면이 기기 언어로 한 번 떴다가 고른 언어로 바뀐다.
 */
export const languageStorage = {
  load(): LanguageType | null {
    const stored = SecureStore.getItem(KEY);

    // 지원 목록이 줄면 저장된 값이 더 이상 고를 수 없는 언어일 수 있다.
    return LANGUAGES.find((language) => language === stored) ?? null;
  },
  save(language: LanguageType) {
    SecureStore.setItem(KEY, language);
  },
};
