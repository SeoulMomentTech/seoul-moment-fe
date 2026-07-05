import type { CreateAdminNewsRequest } from "@shared/services/news";

/**
 * 뉴스 생성/수정 폼 값.
 * V1 API 필드(newsCategoryId 필수, editorPick, hashtagId)를 포함한다.
 * - newsCategoryId: 생성/수정 공통 필수
 * - editorPick, hashtagId: 수정(V1 update)에서 사용
 */
export type NewsFormValues = CreateAdminNewsRequest & {
  newsCategoryId: number;
  editorPick: boolean;
  hashtagId?: number;
};

export type NewsFormErrors = Record<string, string | undefined>;
