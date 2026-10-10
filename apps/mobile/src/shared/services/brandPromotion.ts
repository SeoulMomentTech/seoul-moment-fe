import type { CommonRes, PublicLanguageCode } from ".";
import { api } from ".";

/** 브랜드 프로모션 전환 탭 한 칸. */
export interface BrandPromotionBrand {
  /**
   * 브랜드 프로모션 아이디 — 상세 조회(brand/promotion/v1/{id})의 키다.
   * 브랜드 아이디가 아니다. 둘을 바꿔 쓰면 상세가 404 로 떨어진다.
   */
  id: number;
  /** 브랜드 아이디. 브랜드 소개 화면(/brand/[id])으로 갈 때 쓴다. */
  brandId: number;
  profileImageUrl: string;
  name: string;
}

export interface GetBrandPromotionBrandListRes {
  total: number;
  list: BrandPromotionBrand[];
}

export interface BrandPromotionBanner {
  id: number;
  imageUrl: string;
  mobileImageUrl: string;
  linkUrl: string;
  title: string;
}

export interface BrandPromotionBrandDetail {
  /** 브랜드 아이디(목록의 brandId 와 같은 값). */
  id: number;
  name: string;
  profileImageUrl: string;
  /** 평문이다 — 태그 없이 \n 만 들어 있어 Text 에 그대로 넣는다. */
  description: string;
  likeCount: number;
  /** 브랜드 대표색(hex). 이 화면은 쓰지 않는다 — BrandLookbook 주석 참고. */
  colorCode: string;
  isLiked: boolean;
}

/**
 * 룩북 한 묶음의 배치. 서버가 늘릴 수 있는 값이라 타입으로 좁히지 않고,
 * 모르는 값이 와도 BrandLookbook 이 그 묶음만 건너뛴다.
 */
export type BrandSectionType =
  | "TYPE_1"
  | "TYPE_2"
  | "TYPE_3"
  | "TYPE_4"
  | "TYPE_5";

export interface BrandPromotionSection {
  id: number;
  type: BrandSectionType;
  title: string;
  imageUrlList: string[];
}

export interface BrandPromotionProduct {
  id: number;
  brandName: string;
  productName: string;
  price: number;
  like: number;
  review: number;
  reviewAverage: number;
  /** 상품 목록(ProductItem)의 image 와 같은 것인데 이름만 다르다. */
  imageUrl: string;
}

export interface BrandPromotionPopup {
  id: number;
  place: string;
  address: string;
  latitude: string;
  longitude: string;
  startDate: string;
  startTime: string;
  /** 상시 진행이면 먼 미래(dev 는 2399-01-01)가 온다. null 로 오지 않는다. */
  endDate?: string;
  endTime?: string;
  title: string;
  description: string;
  imageUrlList: string[];
  brandPromotionId: number;
}

export interface BrandPromotionCoupon {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  /** "EXPIRED" 면 쓸 수 없는 쿠폰이다. */
  status: string;
}

export interface BrandPromotionEvent {
  id: number;
  title: string;
  couponList: BrandPromotionCoupon[];
}

export interface BrandPromotionNotice {
  id: number;
  content: string;
}

export interface GetBrandPromotionDetailRes {
  promotionId: number;
  bannerList: BrandPromotionBanner[];
  brand: BrandPromotionBrandDetail;
  sectionList: BrandPromotionSection[];
  productList: BrandPromotionProduct[];
  popupList: BrandPromotionPopup[];
  eventList: BrandPromotionEvent[];
  noticeList: BrandPromotionNotice[];
}

/**
 * @description 한 프로모션에 묶인 브랜드 목록. 홈 Season Collection 카드의 promotionId 로 부른다.
 */
export const getBrandPromotionBrandList = ({
  promotionId,
  languageCode,
}: PublicLanguageCode & { promotionId: number }) =>
  api
    .get(`brand/promotion/${promotionId}/brand`, {
      searchParams: { languageCode },
    })
    .json<CommonRes<GetBrandPromotionBrandListRes>>();

/**
 * @description 브랜드 프로모션 상세. 키는 브랜드 아이디가 아니라 목록이 준 brandPromotionId 다.
 *
 * 이 엔드포인트는 languageCode 쿼리 파라미터를 무시하고 Accept-language 헤더만 읽는다
 * (curl 로 확인: ?languageCode=en 은 한국어를 돌려준다). 그래도 여기서 헤더를 직접 세우지
 * 않는 이유는 services/index 의 beforeRequest 훅이 GET 의 languageCode 를 헤더로 옮기고
 * 쿼리에서 지우기 때문이다 — 앱의 모든 서비스가 같은 길을 지나게 둔다.
 */
export const getBrandPromotionDetail = ({
  brandPromotionId,
  languageCode,
}: PublicLanguageCode & { brandPromotionId: number }) =>
  api
    .get(`brand/promotion/v1/${brandPromotionId}`, {
      searchParams: { languageCode },
    })
    .json<CommonRes<GetBrandPromotionDetailRes>>();
