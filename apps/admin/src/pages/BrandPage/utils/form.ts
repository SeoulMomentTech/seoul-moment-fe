import { LANGUAGE_LIST } from "@shared/constants/locale";
import type {
  AdminBrandDetail,
  AdminBrandMultilingualTextV2,
  CreateAdminBrandRequest,
  V2UpdateAdminBrandRequest,
} from "@shared/services/brand";
import { stripImageDomain } from "@shared/utils/image";
import type { FormikErrors } from "formik";

import { createEmptySection } from "./section";
import { BANNER_REQUIRED_COUNT } from "../constants";

export const getAddFormPayload = (values: CreateAdminBrandRequest) => {
  const payload: CreateAdminBrandRequest = {
    ...values,
    profileImageUrl: stripImageDomain(values.profileImageUrl),
    productBannerImageUrl: stripImageDomain(values.productBannerImageUrl),
    bannerImageUrlList: values.bannerImageUrlList.map(stripImageDomain),
    mobileBannerImageUrlList:
      values.mobileBannerImageUrlList.map(stripImageDomain),
    sectionList: values.sectionList.map((section) => ({
      ...section,
      imageUrlList: section.imageUrlList.map(stripImageDomain),
    })),
  };

  return payload;
};

interface GetEditFormPayload {
  values: CreateAdminBrandRequest;
  data: AdminBrandDetail;
}

export const getEditFormPayload = ({ values }: GetEditFormPayload) => {
  const multilingualTextList: AdminBrandMultilingualTextV2[] =
    values.textList.map((text) => {
      const section = values.sectionList.map((sectionItem) => {
        const sectionText = sectionItem.textList.find(
          (t) => t.languageId === text.languageId,
        );

        return {
          title: sectionText?.title ?? "",
          content: sectionText?.content ?? "",
          imageList: sectionItem.imageUrlList.map(stripImageDomain),
        };
      });

      return {
        languageId: text.languageId,
        name: text.name,
        description: text.description,
        section,
      };
    });

  const payload: V2UpdateAdminBrandRequest = {
    categoryId: values.categoryId,
    englishName: values.englishName,
    profileImage: stripImageDomain(values.profileImageUrl),
    productBannerImage: stripImageDomain(values.productBannerImageUrl),
    bannerList: values.bannerImageUrlList.map(stripImageDomain),
    mobileBannerList: values.mobileBannerImageUrlList.map(stripImageDomain),
    multilingualTextList,
  };

  return payload;
};

export const validateForm = (values: CreateAdminBrandRequest) => {
  const validationErrors: FormikErrors<CreateAdminBrandRequest> &
    Record<string, string> = {};

  if (!values.englishName.trim()) {
    validationErrors.englishName = "영어 이름을 입력해주세요.";
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

export const getInitialValuesFromData = (data: AdminBrandDetail) => {
  const {
    bannerList,
    mobileBannerList,
    multilingualTextList,
    categoryId,
    englishName,
    profileImage,
    productBannerImage,
  } = data;

  const textList = LANGUAGE_LIST.map((language) => {
    const text = multilingualTextList.find(
      (item) => item.languageId === language.id,
    );

    return {
      languageId: language.id,
      name: text?.name ?? "",
      description: text?.description ?? "",
    };
  });

  const sectionCount = multilingualTextList.reduce(
    (max: number, text) => Math.max(max, text.section?.length ?? 0),
    0,
  );

  const sectionList =
    sectionCount > 0
      ? Array.from({ length: sectionCount }, (_, sectionIndex) => {
          const baseSection = createEmptySection();
          const sectionForImages = multilingualTextList.find(
            (text) => text.section?.[sectionIndex]?.imageList.length,
          );
          const imageUrlList =
            sectionForImages?.section?.[sectionIndex]?.imageList ??
            multilingualTextList[0]?.section?.[sectionIndex]?.imageList ??
            [];

          const sectionTextList = LANGUAGE_LIST.map((language) => {
            const section = multilingualTextList.find(
              (text) => text.languageId === language.id,
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
    profileImageUrl: profileImage,
    productBannerImageUrl: productBannerImage,
    textList,
    sectionList,
    bannerImageUrlList: bannerList,
    mobileBannerImageUrlList: mobileBannerList,
  };
};
