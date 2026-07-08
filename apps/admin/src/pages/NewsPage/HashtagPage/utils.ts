import type {
  AdminNewsHashtag,
  AdminNewsNamePayload,
} from "@shared/services/news";

export interface HashtagNames {
  ko: string;
  en: string;
  zh: string;
}

export const EMPTY_NAMES: HashtagNames = { ko: "", en: "", zh: "" };

/** 화면 언어 키 → 서버 languageId 매핑 (ko=1, en=2, zh-TW=3) */
const LANGUAGE_IDS: Record<keyof HashtagNames, number> = {
  ko: 1,
  en: 2,
  zh: 3,
};

/** 화면 언어 키 → 서버 languageCode 매핑 */
const LANGUAGE_CODES: Record<keyof HashtagNames, string> = {
  ko: "ko",
  en: "en",
  zh: "zh-TW",
};

export const toHashtagNamePayload = (
  names: HashtagNames,
): AdminNewsNamePayload[] =>
  (Object.entries(names) as [keyof HashtagNames, string][]).map(
    ([key, name]) => ({
      languageId: LANGUAGE_IDS[key],
      name: name.trim(),
    }),
  );

export const getHashtagName = (
  nameList: AdminNewsHashtag["nameList"],
  languageCode: string = "ko",
): string => {
  const found = nameList.find((item) => item.languageCode === languageCode);
  return found ? found.name : (nameList[0]?.name ?? "");
};

export const toHashtagNames = (
  nameList: AdminNewsHashtag["nameList"],
): HashtagNames => ({
  ko: getHashtagName(nameList, LANGUAGE_CODES.ko),
  en: getHashtagName(nameList, LANGUAGE_CODES.en),
  zh: getHashtagName(nameList, LANGUAGE_CODES.zh),
});
