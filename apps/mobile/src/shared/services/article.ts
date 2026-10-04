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
