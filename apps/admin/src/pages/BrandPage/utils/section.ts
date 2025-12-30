import { LANGUAGE_LIST } from "@shared/constants/locale";

export const createEmptySection = () => ({
  textList: LANGUAGE_LIST.map((language) => ({
    languageId: language.id,
    title: "",
    content: "",
  })),
  imageUrlList: [] as string[],
});

const IMAGE_DOMAIN_REGEX = /https:\/\/image-dev\.seoulmoment\.com\.tw/g;
export const stripImageDomain = (url: string) =>
  url.replace(IMAGE_DOMAIN_REGEX, "");
