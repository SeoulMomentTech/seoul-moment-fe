import { useHomeArticle, useHomeNews, useNowOnSale } from "./useHomeLists";
import { useHomeBanner, useHomePromotion } from "./useHomePrime";

const unresolved = (query: { isPending: boolean; isError: boolean }) =>
  query.isPending || query.isError;

/**
 * 홈의 다섯 섹션이 전부 "그릴 것 없음"으로 끝났는지.
 * 섹션마다 null 을 돌려주는 것은 그대로 맞다 — 빈 제목만 남는 자리를 만들지 않는다.
 * 다만 다섯이 모두 null 이면 헤더 아래가 통째로 흰 종이가 되어, 당겨서 새로고침해 볼
 * 이유조차 화면에 없다. 그 한 경우만 가려낸다.
 *
 * 로딩·에러인 섹션이 하나라도 있으면 그 섹션이 스스로 할 말이 있으므로 false 다.
 * 여기서 쓰는 훅은 각 섹션이 쓰는 것과 queryKey 가 같아 요청이 더 생기지 않는다.
 */
export const useHomeIsEmpty = () => {
  const banner = useHomeBanner();
  const promotion = useHomePromotion();
  const products = useNowOnSale();
  const news = useHomeNews();
  const article = useHomeArticle();

  if (
    unresolved(banner) ||
    unresolved(promotion) ||
    unresolved(products) ||
    unresolved(news) ||
    unresolved(article)
  ) {
    return false;
  }

  return (
    !banner.data &&
    (promotion.data?.length ?? 0) === 0 &&
    (products.data?.length ?? 0) === 0 &&
    (news.data?.length ?? 0) === 0 &&
    (article.data?.length ?? 0) === 0
  );
};
