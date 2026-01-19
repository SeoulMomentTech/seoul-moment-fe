import { LANGUAGE_LIST } from "@shared/constants/locale";
import type {
  AdminBrandDetail,
  CreateAdminBrandRequest,
  UpdateAdminBrandImagePayload,
  UpdateAdminBrandRequest,
  UpdateAdminBrandSectionImageSortOrder,
  UpdateAdminBrandSectionPayload,
  UpdateAdminBrandSectionSortOrder,
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
    productMobileBannerImageUrl: stripImageDomain(
      values.productMobileBannerImageUrl,
    ),
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
  const sections = data.multilingualTextList[0].section;
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
        id: sections[sectionIndex].id,
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

export const getEditFormPayloadV2 = ({ data, values }: GetEditFormPayload) => {
  const baseSections = data.multilingualTextList[0]?.section ?? [];

  const multilingualTextList = values.textList.map((text) => ({
    languageId: text.languageId,
    name: text.name,
    description: text.description,
    section: values.sectionList.map((section, sectionIndex) => {
      const sectionText = section.textList.find(
        (item) => item.languageId === text.languageId,
      );

      return {
        id: baseSections[sectionIndex]?.id ?? 0,
        title: sectionText?.title ?? "",
        content: sectionText?.content ?? "",
        imageList: section.imageUrlList.map((imageUrl) =>
          stripImageDomain(imageUrl),
        ),
      };
    }),
  }));

  const payload: V2UpdateAdminBrandRequest = {
    categoryId: values.categoryId,
    englishName: values.englishName,
    profileImage: stripImageDomain(values.profileImageUrl),
    productBannerImage: stripImageDomain(values.productBannerImageUrl),
    productMobileBannerImage: stripImageDomain(values.productMobileBannerImageUrl),
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
    productMobileBannerImageUrl,
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
    productMobileBannerImageUrl,
    textList,
    sectionList,
    bannerImageUrlList: bannerList,
    mobileBannerImageUrlList: mobileBannerList,
  };
};
