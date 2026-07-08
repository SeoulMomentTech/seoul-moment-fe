import type {
  AdminNewsCategory,
  AdminNewsNamePayload,
} from "@shared/services/news";

export interface CategoryNames {
  ko: string;
  en: string;
  zh: string;
}

export const EMPTY_NAMES: CategoryNames = { ko: "", en: "", zh: "" };

/** 화면 언어 키 → 서버 languageId 매핑 (ko=1, en=2, zh-TW=3) */
const LANGUAGE_IDS: Record<keyof CategoryNames, number> = {
  ko: 1,
  en: 2,
  zh: 3,
};

/** 화면 언어 키 → 서버 languageCode 매핑 */
const LANGUAGE_CODES: Record<keyof CategoryNames, string> = {
  ko: "ko",
  en: "en",
  zh: "zh-TW",
};

export const toCategoryNamePayload = (
  names: CategoryNames,
): AdminNewsNamePayload[] =>
  (Object.entries(names) as [keyof CategoryNames, string][]).map(
    ([key, name]) => ({
      languageId: LANGUAGE_IDS[key],
      name: name.trim(),
    }),
  );

export const getCategoryName = (
  nameList: AdminNewsCategory["nameList"],
  languageCode: string = "ko",
): string => {
  const found = nameList.find((item) => item.languageCode === languageCode);
  return found ? found.name : (nameList[0]?.name ?? "");
};

export const toCategoryNames = (
  nameList: AdminNewsCategory["nameList"],
): CategoryNames => ({
  ko: getCategoryName(nameList, LANGUAGE_CODES.ko),
  en: getCategoryName(nameList, LANGUAGE_CODES.en),
  zh: getCategoryName(nameList, LANGUAGE_CODES.zh),
});
