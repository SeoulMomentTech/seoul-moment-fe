import type { NewsDetailSection, NewsLastItem } from "./news";

import type { CommonRes, PublicLanguageCode } from ".";
import { api } from ".";

export interface Article {
  id: number;
  title: string;
  content: string;
  writer: string;
  createDate: string;
  image: string;
  homeImage: string;
}

export interface GetArticleListRes {
  total: number;
  list: Article[];
}

interface GetArticleListReq extends PublicLanguageCode {
  count: number;
}

/**
 * @description 아티클 목록
 */
export const getArticleList = ({ languageCode, count }: GetArticleListReq) =>
  api
    .get("article/list", {
      searchParams: { languageCode, count },
    })
    .json<CommonRes<GetArticleListRes>>();

export interface GetArticleDetailRes {
  id: number;
  brandId: number;
  writer: string;
  createDate: string;
  category: string;
  title: string;
  content: string;
  banner: string;
  profileImage: string;
  lastArticle: NewsLastItem[];
  section: NewsDetailSection[];
}

/**
 * @description 아티클 상세
 */
export const getArticleDetail = ({
  id,
  languageCode,
}: PublicLanguageCode & { id: number }) =>
  api
    .get(`article/${id}`, { searchParams: { languageCode } })
    .json<CommonRes<GetArticleDetailRes>>();
