import useAppQuery from "@shared/lib/hooks/query/useAppQuery";
import { useLanguage } from "@shared/lib/i18n/useLanguage";
import type { Article, GetArticleListRes } from "@shared/services/article";
import { getArticleList } from "@shared/services/article";
import type { GetNewsListRes, News } from "@shared/services/news";
import { getNewsList } from "@shared/services/news";
import type { GetProductListRes, ProductItem } from "@shared/services/product";
import { getProductList } from "@shared/services/product";

import type { CommonRes } from "@shared/services";

const NOW_ON_SALE_COUNT = 4;
// 가로 슬라이드라 개수를 늘려도 홈 길이가 늘지 않는다. 웹 홈과 같은 9 를 쓴다.
// dev 기준 뉴스는 14건 중 9건, 아티클은 있는 5건이 전부 온다.
const POST_COUNT = 9;

export const useNowOnSale = () => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["home", "product", languageCode] as const,
    queryFn: () =>
      getProductList({
        languageCode,
        page: 1,
        count: NOW_ON_SALE_COUNT,
        mainView: true,
      }),
    select: (res: CommonRes<GetProductListRes>): ProductItem[] =>
      res.data.list ?? [],
  });
};

export const useHomeNews = () => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["home", "news", languageCode] as const,
    queryFn: () => getNewsList({ languageCode, count: POST_COUNT }),
    select: (res: CommonRes<GetNewsListRes>): News[] => res.data.list ?? [],
  });
};

export const useHomeArticle = () => {
  const languageCode = useLanguage();

  return useAppQuery({
    queryKey: ["home", "article", languageCode] as const,
    queryFn: () => getArticleList({ languageCode, count: POST_COUNT }),
    select: (res: CommonRes<GetArticleListRes>): Article[] =>
      res.data.list ?? [],
  });
};
