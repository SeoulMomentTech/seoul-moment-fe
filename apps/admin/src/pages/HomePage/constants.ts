import {
  BookOpenText,
  Image,
  Newspaper,
  Package,
  Tag,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";

import { PATH } from "@shared/constants/route";
import { getAdminArticleList } from "@shared/services/article";
import { getAdminBrandList } from "@shared/services/brand";
import { getAdminNewsList } from "@shared/services/news";
import { getAdminProductItemList } from "@shared/services/products";
import { getAdminPromotionList } from "@shared/services/promotion";

/**
 * 대시보드 카드는 사이드바(`shared/components/sidebar.tsx`)의 menuItems 와 별개 배열이다.
 * 카드에만 필요한 필드(건수 조회 함수, 단위)가 있어 의도적으로 결합하지 않았으니,
 * 사이드바에 관리 메뉴를 추가하면 이 파일도 함께 손봐야 한다.
 */

/** 카드 하단에 깔리는 하위 메뉴 바로가기 */
export interface DashboardSubLink {
  label: string;
  path: string;
}

/** 카드 겉모습에 필요한 정보. 로딩·에러 상태에서도 그대로 쓰여야 해서 데이터와 분리했다 */
export interface DashboardCardMeta {
  label: string;
  path: string;
  icon: LucideIcon;
  subLinks?: readonly DashboardSubLink[];
}

export type DashboardCountCardId =
  | "products"
  | "brands"
  | "news"
  | "articles"
  | "promotions";

export interface DashboardCountCard extends DashboardCardMeta {
  id: DashboardCountCardId;
  /** 숫자 뒤에 붙는 단위 */
  unit: string;
  fetchTotal(): Promise<number>;
}

/** 총 건수만 읽고 목록은 버리므로 가장 작은 페이지를 요청한다 */
const COUNT_ONLY_PARAMS = { page: 1, count: 1 } as const;

/** 회원 카드는 전용 집계 API 를 쓰고 서브텍스트도 있어서 COUNT_CARDS 와 따로 둔다 */
export const MEMBER_CARD: DashboardCardMeta = {
  label: "회원 관리",
  path: PATH.MEMBERS,
  icon: Users,
};

/** 목록 API 의 total 만 읽어 오는, 형태가 완전히 같은 카드들 */
export const COUNT_CARDS: readonly DashboardCountCard[] = [
  {
    id: "products",
    label: "상품 관리",
    path: PATH.PRODUCTS,
    icon: Package,
    unit: "개",
    fetchTotal: () =>
      getAdminProductItemList(COUNT_ONLY_PARAMS).then((res) => res.data.total),
    subLinks: [
      { label: "상품 대주제", path: PATH.PRODUCT_MASTER },
      { label: "카테고리", path: PATH.PRODUCT_CATEGORIES },
      { label: "서브 카테고리", path: PATH.PRODUCT_SUB_CATEGORIES },
      { label: "상품 옵션", path: PATH.PRODUCT_OPTIONS },
    ],
  },
  {
    id: "brands",
    label: "브랜드 관리",
    path: PATH.BRAND,
    icon: Tag,
    unit: "개",
    fetchTotal: () =>
      getAdminBrandList(COUNT_ONLY_PARAMS).then((res) => res.data.total),
    subLinks: [{ label: "이벤트 관리", path: PATH.BRAND_PROMOTION }],
  },
  {
    id: "news",
    label: "뉴스 관리",
    path: PATH.NEWS,
    icon: Newspaper,
    unit: "건",
    fetchTotal: () =>
      getAdminNewsList(COUNT_ONLY_PARAMS).then((res) => res.data.total),
    subLinks: [
      { label: "카테고리 관리", path: PATH.NEWS_CATEGORY },
      { label: "해시태그 관리", path: PATH.NEWS_HASHTAG },
    ],
  },
  {
    id: "articles",
    label: "아티클 관리",
    path: PATH.ARTICLE,
    icon: BookOpenText,
    unit: "건",
    fetchTotal: () =>
      getAdminArticleList(COUNT_ONLY_PARAMS).then((res) => res.data.total),
  },
  {
    id: "promotions",
    label: "프로모션 관리",
    path: PATH.PROMOTION,
    icon: Ticket,
    unit: "건",
    fetchTotal: () =>
      getAdminPromotionList(COUNT_ONLY_PARAMS).then((res) => res.data.total),
  },
];

/**
 * 홈 배너와 상품 배너는 별개 도메인이라 하나의 숫자로 합치면 오해를 부른다.
 * 건수 없이 바로가기만 제공한다.
 */
export const BANNER_CARD: DashboardCardMeta = {
  label: "배너 관리",
  path: PATH.HOME_BANNER,
  icon: Image,
  subLinks: [
    { label: "홈 배너", path: PATH.HOME_BANNER },
    { label: "상품 배너", path: PATH.PRODUCT_BANNER },
  ],
};

export const BANNER_CARD_DESCRIPTION =
  "홈 화면과 상품 목록에 노출되는 배너를 관리합니다.";
