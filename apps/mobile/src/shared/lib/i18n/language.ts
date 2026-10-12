import { getLocales } from "expo-localization";

export type LanguageType = "ko" | "en" | "zh-TW";

export const languageMap: Record<LanguageType, string> = {
  ko: "ko",
  en: "en",
  "zh-TW": "zh-TW",
};

/** 고르는 차례. web 의 localeLabels 와 같은 순서다. */
export const LANGUAGES: readonly LanguageType[] = ["ko", "en", "zh-TW"];

/**
 * 언어 이름은 **그 언어로** 적는다 — 번역하지 않는다. 지금 화면이 못 읽는 언어로
 * 되어 있을 때 제 언어를 찾아 나올 수 있어야 하는데, 이름까지 그 언어로 적히면
 * 그 길이 막힌다. web 의 localeLabels 와 같은 글자다.
 */
export const LANGUAGE_LABELS: Record<LanguageType, string> = {
  ko: "한국어",
  en: "English",
  "zh-TW": "繁體中文",
};

/**
 * 기기 언어 설정에서 지원 언어를 고른다. 중국어는 번체(대만)만 지원하므로
 * zh-Hant 계열은 zh-TW 로, 그 외 미지원 언어는 ko 로 떨어진다.
 */
export const getDeviceLanguage = (): LanguageType => {
  for (const locale of getLocales()) {
    const { languageCode, languageScriptCode, regionCode } = locale;

    if (languageCode === "ko") return "ko";
    if (languageCode === "en") return "en";
    if (
      languageCode === "zh" &&
      (languageScriptCode === "Hant" ||
        regionCode === "TW" ||
        regionCode === "HK" ||
        regionCode === "MO")
    ) {
      return "zh-TW";
    }
  }

  return "ko";
};
