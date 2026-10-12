import { LANGUAGES, type LanguageType } from "./language";

const KEY = "app.language";

/**
 * expo-secure-store 는 web 구현이 없다. tokenStorage.web 과 달리 메모리에 두지 않고
 * localStorage 를 쓴다 — 토큰은 새로고침에 날아가도 되지만(개발 확인용), 언어는
 * 날아가면 고른 것이 매번 풀려 스위치가 동작하지 않는 것처럼 보인다.
 */
export const languageStorage = {
  load(): LanguageType | null {
    // 사생활 보호 모드나 저장소가 막힌 브라우저에서는 접근 자체가 던진다.
    try {
      const stored = window.localStorage.getItem(KEY);
      return LANGUAGES.find((language) => language === stored) ?? null;
    } catch {
      return null;
    }
  },
  save(language: LanguageType) {
    try {
      window.localStorage.setItem(KEY, language);
    } catch {
      // 못 적어도 이번 세션 동안은 스토어가 값을 들고 있다.
    }
  },
};
