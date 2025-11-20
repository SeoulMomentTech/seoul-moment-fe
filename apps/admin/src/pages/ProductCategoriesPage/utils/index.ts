export const LANGUAGE_IDS = {
  ko: 1,
  en: 2,
  zh: 3,
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
      languageId: LANGUAGE_IDS[code],
      name: name.trim(),
    }),
  );

export const makeNameChangeHandler =
  (setter: (updater: (prev: CategoryNames) => CategoryNames) => void) =>
  (field: keyof CategoryNames) =>
  (value: string) =>
    setter((prev) => ({ ...prev, [field]: value }));
