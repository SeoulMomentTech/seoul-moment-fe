import type { CommonRes, PublicLanguageCode } from "./";
import { api } from "./";

interface HomeSection {
  title: string;
  description: string;
  url: string;
  urlName: string;
  image: string[];
}

export interface GetHomeRes {
  banner: Array<Record<"image" | "mobileImage", string>>;
  section: HomeSection[];
}

export const getHome = ({ languageCode }: PublicLanguageCode) =>
  api
    .get("home", {
      searchParams: {
        languageCode,
      },
    })
    .json<CommonRes<GetHomeRes>>();
