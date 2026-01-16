import type { CreateAdminNewsRequest } from "@shared/services/news";

import type { NewsFormErrors } from "./types";

interface LanguageInfo {
  id: number;
}

export const createInitialValues = (
  languages: LanguageInfo[],
): CreateAdminNewsRequest => ({
  categoryId: 1,
  brandId: undefined,
  writer: "",
  banner: "",
  profile: "",
  homeImage: "",
  list: languages.map((language) => ({
    languageId: language.id,
    title: "",
    content: "",
  })),
  sectionList: [],
});

export const validateNewsForm = (
  values: CreateAdminNewsRequest,
): NewsFormErrors => {
  const errors: NewsFormErrors = {};

  if (!values.categoryId || Number.isNaN(values.categoryId)) {
    errors.categoryId = "카테고리 ID를 입력해주세요.";
  }

  if (!values.writer.trim()) {
    errors.writer = "작성자를 입력해주세요.";
  }

  if (!values.banner.trim()) {
    errors.banner = "배너 이미지 URL을 입력해주세요.";
  }

  if (!values.profile.trim()) {
    errors.profile = "프로필 이미지 URL을 입력해주세요.";
  }

  if (!values.homeImage.trim()) {
    errors.homeImage = "홈 이미지 URL을 입력해주세요.";
  }

  const korean = values.list.find((item) => item.languageId === 1);
  if (!korean?.title.trim()) {
    errors.title_1 = "한국어 제목은 필수입니다.";
  }
  if (!korean?.content.trim()) {
    errors.content_1 = "한국어 내용은 필수입니다.";
  }

  values.sectionList.forEach((section, sectionIndex) => {
    section.textList.forEach((text) => {
      if (!text.title.trim()) {
        errors[`section_title_${sectionIndex}_${text.languageId}`] =
          "섹션 제목은 필수입니다.";
      }
      if (!text.content.trim()) {
        errors[`section_content_${sectionIndex}_${text.languageId}`] =
          "섹션 내용은 필수입니다.";
      }
    });
  });

  return errors;
};
