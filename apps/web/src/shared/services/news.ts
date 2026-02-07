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
