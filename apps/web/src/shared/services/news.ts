import type { CommonRes, PublicLanguageCode } from "./";
import { api } from "./";

interface GetNewsListReq extends PublicLanguageCode {
  count: number;
}

export interface News {
  id: number;
  title: string;
  content: string;
  writer: string;
  createDate: string;
  image: string;
  homeImage: string;
  newsCategoryName: string;
}

interface GetNewsListRes {
  total: number;
  list: News[];
}

export const getNewsList = ({ count, languageCode }: GetNewsListReq) =>
  api
    .get("news/list", {
      searchParams: {
        languageCode,
        count,
      },
    })
    .json<CommonRes<GetNewsListRes>>();

interface GetNewsDetailReq extends PublicLanguageCode {
  id: number;
}

export interface LastNews {
  id: number;
  banner: string;
  title: string;
}

export interface NewsSection {
  title: string;
  subTitle: string;
  content: string;
  imageList: string[];
}

export interface GetNewsDetailRes {
  id: number;
  brandId: number;
  writer: string;
  createDate: string;
  category: string;
  title: string;
  content: string;
  banner: string;
  profileImage: string;
  lastNews: LastNews[];
  section: NewsSection[];
}

export const getNewsDetail = ({ id, languageCode }: GetNewsDetailReq) =>
  api
    .get(`news/${id}`, {
      searchParams: {
        languageCode,
      },
    })
    .json<CommonRes<GetNewsDetailRes>>();

export interface GetNewsByCategoryReq extends PublicLanguageCode {
  page?: number;
  count?: number;
  search?: string;
  sort?: "ASC" | "DESC";
  categoryId?: number;
}

/**
 * @description 뉴스 카테고리 ID 기준 뉴스 리스트 조회 (다국어)
 */
export const getNewsByCategory = (params: GetNewsByCategoryReq) => {
  const searchParams = Object.entries(params).reduce<
    Array<Array<string | number>>
  >(
    (acc, [key, value]) =>
      value === undefined || value === null ? acc : [...acc, [key, value]],
    [],
  );

  return api
    .get("news/category", {
      searchParams,
    })
    .json<CommonRes<GetNewsListRes>>();
};

export interface NewsCategory {
  categoryId: number;
  name: string;
}

export interface NewsDashboardHashtag {
  name: string;
  list: News[];
}

export interface GetNewsDashboardRes {
  recentList: News[];
  editorPickList: News[];
  hashtag: NewsDashboardHashtag;
  newsCategoryCardList: News[];
  newsCategoryList: NewsCategory[];
}

/**
 * @description 뉴스 대시보드 조회 (최근/편집자추천/해시태그/카테고리, 다국어)
 */
export const getNewsDashboard = ({ languageCode }: PublicLanguageCode) =>
  api
    .get("news/dashboard", {
      searchParams: {
        languageCode,
      },
    })
    .json<CommonRes<GetNewsDashboardRes>>();
