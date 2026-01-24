import type {
  AdminProductCategoryDetail,
  AdminProductCategoryListItem,
} from "@shared/services/productCategory";

export const LANGUAGE_IDS = {
  ko: 1,
  en: 2,
  zh: 3,
} as const;

export interface SubCategoryFormValues {
  ko: string;
  en: string;
  zh: string;
  categoryId: number | "";
  imageUrl: string;
}

export const EMPTY_SUBCATEGORY_FORM: SubCategoryFormValues = {
  ko: "",
  en: "",
  zh: "",
  categoryId: "",
  imageUrl: "",
};

export const toNamePayload = (
  names: Pick<SubCategoryFormValues, "ko" | "en" | "zh">,
) =>
  [
    { code: "ko", value: names.ko },
    { code: "en", value: names.en },
    { code: "zh-TW", value: names.zh },
  ]
    .filter(({ value }) => value.trim())
    .map(({ code, value }) => ({
      languageId:
        code === "ko"
          ? LANGUAGE_IDS.ko
          : code === "en"
            ? LANGUAGE_IDS.en
            : LANGUAGE_IDS.zh,
      name: value.trim(),
    }));

const getNameFromDto = (
  subcategory: Pick<AdminProductCategoryListItem, "nameDto">,
  languageCode: string,
) =>
  subcategory.nameDto.find((n) => n.languageCode === languageCode)?.name ?? "";

export const toSubCategoryFormValues = (
  subcategory: AdminProductCategoryListItem | AdminProductCategoryDetail | null,
): SubCategoryFormValues => {
  if (!subcategory) {
    return EMPTY_SUBCATEGORY_FORM;
  }

  if ("nameDto" in subcategory) {
    return {
      ko: getNameFromDto(subcategory, "ko"),
      en: getNameFromDto(subcategory, "en"),
      zh: getNameFromDto(subcategory, "zh-TW"),
      categoryId: "",
      imageUrl: subcategory.imageUrl ?? "",
    };
  }

  const idToCode: Record<number, keyof SubCategoryFormValues> = {
    [LANGUAGE_IDS.ko]: "ko",
    [LANGUAGE_IDS.en]: "en",
    [LANGUAGE_IDS.zh]: "zh",
  };

  const names = subcategory.list.reduce(
    (acc, { languageId, name }) => {
      const key = idToCode[languageId];
      if (!key) return acc;
      return { ...acc, [key]: name };
    },
    { ...EMPTY_SUBCATEGORY_FORM },
  );

  return {
    ...names,
    categoryId: subcategory.categoryId ? Number(subcategory.categoryId) : "",
    imageUrl: subcategory.imageUrl ?? "",
  };
};
