import type { CommonRes, PublicLanguageCode } from "./";
import { api } from "./";

interface GetArticleListReq extends PublicLanguageCode {
  count: number;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  writer: string;
  createDate: string;
  image: string;
  homeImage: string;
}

interface GetArticleListRes {
  total: number;
  list: Article[];
}

export const getArticleList = ({ count, languageCode }: GetArticleListReq) =>
  api
    .get("article/list", {
      searchParams: {
        languageCode,
        count,
      },
    })
    .json<CommonRes<GetArticleListRes>>();

interface GetArticleDetailReq extends PublicLanguageCode {
  id: number;
}

interface LastArticle {
  id: number;
  banner: string;
  title: string;
}

export interface ArticleSection {
  title: string;
  subTitle: string;
  content: string;
  imageList: string[];
}

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
  lastArticle: LastArticle[];
  section: ArticleSection[];
}

export const getArticleDetail = ({ id, languageCode }: GetArticleDetailReq) =>
  api
    .get(`article/${id}`, {
      searchParams: {
        languageCode,
      },
    })
    .json<CommonRes<GetArticleDetailRes>>();
