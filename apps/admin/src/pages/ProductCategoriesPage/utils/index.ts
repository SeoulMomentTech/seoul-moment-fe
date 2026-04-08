const LANGUAGE_CODES = {
  ko: "ko",
  en: "en",
  zh: "zh-TW",
} as const;

export interface CategoryNames {
  ko: string;
  en: string;
  zh: string;
}

export const EMPTY_NAMES: CategoryNames = { ko: "", en: "", zh: "" };

export const toNamePayload = (names: CategoryNames) =>
  (Object.entries(names) as [keyof CategoryNames, string][]).map(
    ([code, name]) => ({
      languageCode: LANGUAGE_CODES[code],
      name: name.trim(),
    }),
  );

export const makeNameChangeHandler =
  (setter: (updater: (prev: CategoryNames) => CategoryNames) => void) =>
  (field: keyof CategoryNames) =>
  (value: string) =>
    setter((prev) => ({ ...prev, [field]: value }));
