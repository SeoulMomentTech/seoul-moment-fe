import { LANGUAGE_LIST } from "@shared/constants/locale";
import type {
  AdminBrandDetail,
  CreateAdminBrandRequest,
  UpdateAdminBrandImagePayload,
  UpdateAdminBrandRequest,
  UpdateAdminBrandSectionImageSortOrder,
  UpdateAdminBrandSectionPayload,
  UpdateAdminBrandSectionSortOrder,
} from "@shared/services/brand";
import type { FormikErrors } from "formik";

import { stripImageDomain } from "./section";
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

export const getEditFormPayload = ({ data, values }: GetEditFormPayload) => {
  const sectionId = data.multilingualTextList[0].section[0].id;
  const existingBannerList = data.bannerList ?? [];
  const existingMobileBannerList = data.mobileBannerList ?? [];
  const existingSectionImageLists = (() => {
    const multilingualTextList = data.multilingualTextList;
    if (!multilingualTextList?.length) return [];

    const sectionCount = multilingualTextList.reduce(
      (max, text) => Math.max(max, text.section?.length ?? 0),
      0,
    );

    return Array.from({ length: sectionCount }, (_, sectionIndex) => {
      const sectionForImages = multilingualTextList.find(
        (text) => text.section?.[sectionIndex]?.imageList.length,
      );

      return (
        sectionForImages?.section?.[sectionIndex]?.imageList ??
        multilingualTextList[0]?.section?.[sectionIndex]?.imageList ??
        []
      );
    });
  })();

  const bannerImageUrlList: UpdateAdminBrandImagePayload[] =
    values.bannerImageUrlList.map((imageUrl, index) => ({
      oldImageUrl: stripImageDomain(existingBannerList[index] ?? imageUrl),
      newImageUrl: stripImageDomain(imageUrl),
    }));

  const mobileBannerImageUrlList: UpdateAdminBrandImagePayload[] =
    values.mobileBannerImageUrlList.map((imageUrl, index) => ({
      oldImageUrl: stripImageDomain(
        existingMobileBannerList[index] ?? imageUrl,
      ),
      newImageUrl: stripImageDomain(imageUrl),
    }));

  const sectionList: UpdateAdminBrandSectionPayload[] = values.sectionList.map(
    (section, sectionIndex) => {
      const imageUrlList: UpdateAdminBrandImagePayload[] =
        section.imageUrlList.map((imageUrl, imageIndex) => ({
          oldImageUrl: stripImageDomain(
            existingSectionImageLists[sectionIndex]?.[imageIndex] ?? imageUrl,
          ),
          newImageUrl: stripImageDomain(imageUrl),
        }));

      const imageSortOrderList: UpdateAdminBrandSectionImageSortOrder[] =
        section.imageUrlList.map((imageUrl, imageIndex) => ({
          imageUrl: stripImageDomain(imageUrl),
          sortOrder: imageIndex + 1,
        }));

      return {
        id: sectionId,
        textList: section.textList,
        imageUrlList,
        imageSortOrderList,
      };
    },
  );

  const sectionSortOrderList: UpdateAdminBrandSectionSortOrder[] =
    sectionList.map((section, sectionIndex) => ({
      sectionId: section.id,
      sortOrder: sectionIndex + 1,
    }));

  const payload: UpdateAdminBrandRequest = {
    textList: values.textList,
    categoryId: values.categoryId,
    profileImageUrl: stripImageDomain(values.profileImageUrl),
    sectionList,
    bannerImageUrlList,
    mobileBannerImageUrlList,
    productBannerImage: stripImageDomain(values.productBannerImageUrl),
    englishName: values.englishName,
    sectionSortOrderList,
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
