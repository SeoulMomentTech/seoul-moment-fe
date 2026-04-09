import { LANGUAGE_LIST } from "@shared/constants/locale";
import type {
  AdminBrandLanguageCode,
  CreateAdminBrandRequest,
  V1AdminBrandDetail,
  V1CreateAdminBrandRequest,
  V1UpdateAdminBrandInfoText,
  V1UpdateAdminBrandRequest,
} from "@shared/services/brand";
import type { FormikErrors } from "formik";

import { createEmptySection } from "./section";
import { BANNER_REQUIRED_COUNT } from "../constants";

const LANGUAGE_ID_TO_CODE: Record<number, AdminBrandLanguageCode> = {
  1: "ko",
  2: "en",
  3: "zh-TW",
};

export const getAddFormPayload = (
  values: CreateAdminBrandRequest,
): V1CreateAdminBrandRequest => ({
  languageList: values.textList.map((text) => ({
    languageCode: LANGUAGE_ID_TO_CODE[text.languageId],
    name: text.name,
    description: text.description,
  })),
  categoryId: values.categoryId,
  profileImageUrl: values.profileImageUrl || undefined,
  sectionList: values.sectionList.map((section) => ({
    languageList: section.textList.map((text) => ({
      languageCode: LANGUAGE_ID_TO_CODE[text.languageId],
      title: text.title,
      content: text.content,
    })),
    imageUrlList: section.imageUrlList,
  })),
  bannerImageUrlList: values.bannerImageUrlList,
  mobileBannerImageUrlList: values.mobileBannerImageUrlList,
  productBannerImageUrl: values.productBannerImageUrl,
  englishName: values.englishName,
  colorCode: values.colorCode || undefined,
});

export const getEditFormPayload = ({
  values,
}: {
  values: CreateAdminBrandRequest;
  data: V1AdminBrandDetail;
}): V1UpdateAdminBrandRequest => {
  const languageList: V1UpdateAdminBrandInfoText[] = values.textList.map((text) => {
    const languageCode = LANGUAGE_ID_TO_CODE[text.languageId];

    const section = values.sectionList.map((sectionItem) => {
      const sectionText = sectionItem.textList.find(
        (t) => t.languageId === text.languageId,
      );

      return {
        title: sectionText?.title ?? "",
        content: sectionText?.content ?? "",
        imageUrlList: sectionItem.imageUrlList,
      };
    });

    return {
      languageCode,
      name: text.name,
      description: text.description,
      section,
    };
  });

  return {
    categoryId: values.categoryId,
    englishName: values.englishName,
    profileImageUrl: values.profileImageUrl,
    productBannerImageUrl: values.productBannerImageUrl,
    bannerImageUrlList: values.bannerImageUrlList,
    mobileBannerImageUrlList: values.mobileBannerImageUrlList,
    languageList,
    colorCode: values.colorCode,
  };
};

export const validateForm = (values: CreateAdminBrandRequest) => {
  const validationErrors: FormikErrors<CreateAdminBrandRequest> &
    Record<string, string> = {};

  if (!values.englishName.trim()) {
    validationErrors.englishName = "영어 이름을 입력해주세요.";
  }

  if (!values.colorCode.trim()) {
    validationErrors.colorCode = "브랜드 컬러를 입력해주세요.";
  } else if (!/^#[0-9A-Fa-f]{6}$/.test(values.colorCode)) {
    validationErrors.colorCode = "올바른 헥사 코드 형식이 아닙니다. (#000000)";
  }

  if (!values.profileImageUrl) {
    validationErrors.profileImageUrl = "프로필 이미지를 업로드해주세요.";
  }

  values.textList.forEach((text) => {
    const languageName =
      LANGUAGE_LIST.find((language) => language.id === text.languageId)?.name ??
      "";

    if (!text.name.trim()) {
      validationErrors[`name_${text.languageId}`] =
        `${languageName} 브랜드명을 입력해주세요.`;
    }

    if (!text.description.trim()) {
      validationErrors[`description_${text.languageId}`] =
        `${languageName} 설명을 입력해주세요.`;
    }
  });

  values.sectionList.forEach((section, sectionIndex) => {
    section.textList.forEach((text) => {
      const languageName =
        LANGUAGE_LIST.find((language) => language.id === text.languageId)
          ?.name ?? "";

      if (!text.title.trim()) {
        validationErrors[`section_${sectionIndex}_title_${text.languageId}`] =
          `${languageName} 섹션 제목을 입력해주세요.`;
      }

      if (!text.content.trim()) {
        validationErrors[`section_${sectionIndex}_content_${text.languageId}`] =
          `${languageName} 섹션 내용을 입력해주세요.`;
      }
    });
  });

  if (values.bannerImageUrlList.length < BANNER_REQUIRED_COUNT) {
    validationErrors.bannerImageUrlList = `PC 배너 이미지를 ${BANNER_REQUIRED_COUNT}장 업로드해주세요.`;
  }

  if (values.mobileBannerImageUrlList.length < BANNER_REQUIRED_COUNT) {
    validationErrors.mobileBannerImageUrlList = `모바일 배너 이미지를 ${BANNER_REQUIRED_COUNT}장 업로드해주세요.`;
  }

  return validationErrors;
};

export const getInitialValuesFromData = (data: V1AdminBrandDetail) => {
  const {
    bannerImageUrlList,
    mobileBannerImageUrlList,
    languageList,
    categoryId,
    englishName,
    profileImageUrl,
    productBannerImageUrl,
    colorCode,
  } = data;

  const textList = LANGUAGE_LIST.map((language) => {
    const langCode = LANGUAGE_ID_TO_CODE[language.id];
    const text = languageList.find((item) => item.languageCode === langCode);

    return {
      languageId: language.id,
      name: text?.name ?? "",
      description: text?.description ?? "",
    };
  });

  const sectionCount = languageList.reduce(
    (max: number, text) => Math.max(max, text.section?.length ?? 0),
    0,
  );

  const sectionList =
    sectionCount > 0
      ? Array.from({ length: sectionCount }, (_, sectionIndex) => {
        const baseSection = createEmptySection();
        const sectionForImages = languageList.find(
          (text) => text.section?.[sectionIndex]?.imageUrlList.length,
        );
        const imageUrlList =
          sectionForImages?.section?.[sectionIndex]?.imageUrlList ??
          languageList[0]?.section?.[sectionIndex]?.imageUrlList ??
          [];

        const sectionTextList = LANGUAGE_LIST.map((language) => {
          const langCode = LANGUAGE_ID_TO_CODE[language.id];
          const section = languageList.find(
            (text) => text.languageCode === langCode,
          )?.section?.[sectionIndex];

          return {
            languageId: language.id,
            title: section?.title ?? "",
            content: section?.content ?? "",
          };
        });

        return {
          ...baseSection,
          imageUrlList,
          textList: sectionTextList,
        };
      })
      : [createEmptySection()];

  return {
    englishName,
    categoryId,
    profileImageUrl,
    productBannerImageUrl,
    textList,
    sectionList,
    bannerImageUrlList,
    mobileBannerImageUrlList,
    colorCode,
  };
};
