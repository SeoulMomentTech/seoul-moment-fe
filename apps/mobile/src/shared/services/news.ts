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
