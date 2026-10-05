import type { CommonRes, PublicLanguageCode } from ".";
import { api } from ".";

export interface News {
  id: number;
  title: string;
  content: string;
  writer: string;
  createDate: string;
  image: string;
  homeImage: string;
}

export interface GetNewsListRes {
  total: number;
  list: News[];
}

interface GetNewsListReq extends PublicLanguageCode {
  count: number;
}

/**
 * @description 뉴스 목록
 */
export const getNewsList = ({ languageCode, count }: GetNewsListReq) =>
  api
    .get("news/list", {
      searchParams: { languageCode, count },
    })
    .json<CommonRes<GetNewsListRes>>();

// news/list 와 달리 dashboard·category 응답은 newsCategoryName 을 함께 준다.
export interface NewsWithCategory extends News {
  newsCategoryName: string;
}

export interface NewsDashboardHashtag {
  name: string;
  list: NewsWithCategory[];
}

// newsCategoryCardList, newsCategoryList 도 응답에 오지만 여기서는 쓰지 않아 타입에서 뺐다.
export interface GetNewsDashboardRes {
  recentList: NewsWithCategory[];
  editorPickList: NewsWithCategory[];
  hashtag: NewsDashboardHashtag;
}

/**
 * @description 뉴스 대시보드
 */
export const getNewsDashboard = ({ languageCode }: PublicLanguageCode) =>
  api
    .get("news/dashboard", {
      searchParams: { languageCode },
    })
    .json<CommonRes<GetNewsDashboardRes>>();

export interface GetNewsByCategoryRes {
  total: number;
  list: NewsWithCategory[];
}

export interface GetNewsByCategoryReq extends PublicLanguageCode {
  page: number;
  count: number;
  categoryId?: number;
  search?: string;
  sort?: "ASC" | "DESC";
}

/**
 * @description 카테고리별 뉴스 목록 (페이지네이션)
 */
export const getNewsByCategory = (params: GetNewsByCategoryReq) => {
  const searchParams = Object.entries(params).reduce<
    [string, string | number][]
  >(
    (acc, [key, value]) =>
      value === undefined || value === null ? acc : [...acc, [key, value]],
    [],
  );

  return api
    .get("news/category", { searchParams })
    .json<CommonRes<GetNewsByCategoryRes>>();
};

export interface NewsDetailSection {
  title: string;
  subTitle: string;
  content: string;
  imageList: string[];
}

export interface NewsLastItem {
  id: number;
  banner: string;
  title: string;
}

export interface GetNewsDetailRes {
  id: number;
  writer: string;
  createDate: string;
  category: string;
  title: string;
  content: string;
  banner: string;
  profileImage: string;
  lastNews: NewsLastItem[];
  section: NewsDetailSection[];
}

/**
 * @description 뉴스 상세
 */
export const getNewsDetail = ({
  id,
  languageCode,
}: PublicLanguageCode & { id: number }) =>
  api
    .get(`news/${id}`, { searchParams: { languageCode } })
    .json<CommonRes<GetNewsDetailRes>>();
