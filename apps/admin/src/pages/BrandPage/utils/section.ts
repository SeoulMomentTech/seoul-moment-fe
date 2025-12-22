import { LANGUAGE_LIST } from "@shared/constants/locale";

export const createEmptySection = () => ({
  textList: LANGUAGE_LIST.map((language) => ({
    languageId: language.id,
    title: "",
    content: "",
  })),
  imageUrlList: [] as string[],
});
