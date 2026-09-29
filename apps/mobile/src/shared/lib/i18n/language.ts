import { getLocales } from "expo-localization";

export type LanguageType = "ko" | "en" | "zh-TW";

export const languageMap: Record<LanguageType, string> = {
  ko: "ko",
  en: "en",
  "zh-TW": "zh-TW",
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
