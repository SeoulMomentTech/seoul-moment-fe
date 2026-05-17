import type {
  UserBrandLike,
  UserBrandLikeProduct,
  UserProductLike,
} from "@shared/services/userLike";
import type { UserRecentProduct } from "@shared/services/userRecent";

const buildBrandProducts = (label: string): UserBrandLikeProduct[] => [
  {
    productItemId: Number(`${label.charCodeAt(0)}01`),
    productName: `${label} 맨체스터 유나이티드 23/24 어웨이 저지`,
    imageUrl: "https://placehold.co/100x100/2a3d5f/fff?text=01",
    price: 96000,
  },
  {
    productItemId: Number(`${label.charCodeAt(0)}02`),
    productName: `${label} 맨체스터 유나이티드 23/24 홈 저지`,
    imageUrl: "https://placehold.co/100x100/3a4d6f/fff?text=02",
    price: 96000,
  },
  {
    productItemId: Number(`${label.charCodeAt(0)}03`),
    productName: `${label} 맨체스터 유나이티드 23/24 트레이닝`,
    imageUrl: "https://placehold.co/100x100/4a5d7f/fff?text=03",
    price: 96000,
  },
  {
    productItemId: Number(`${label.charCodeAt(0)}04`),
    productName: `${label} 맨체스터 유나이티드 23/24 폴로`,
    imageUrl: "https://placehold.co/100x100/5a6d8f/fff?text=04",
    price: 96000,
  },
];

export const MOCK_INTEREST_PRODUCT_ITEMS: UserProductLike[] = [
  {
    productItemId: 1,
    brandName: "HERA",
    productName: "UV 프로텍터 톤업 SPF50+",
    imageUrl: "https://placehold.co/80x80/f4e2d8/333?text=01",
    price: 36000,
  },
  {
    productItemId: 2,
    brandName: "HERA",
    productName: "TUNNEL LINING TROUSE",
    imageUrl: "https://placehold.co/80x80/ffd7c2/333?text=02",
    price: 32000,
  },
  {
    productItemId: 3,
    brandName: "HERA",
    productName: "센슈얼 파우더 매트 립스틱",
    imageUrl: "https://placehold.co/80x80/f4b5b5/333?text=03",
    price: 40500,
  },
  {
    productItemId: 4,
    brandName: "HERA",
    productName: "옴므 에센스 안티 에이징스킨",
    imageUrl: "https://placehold.co/80x80/e8e8e8/333?text=04",
    price: 43000,
  },
];

export const MOCK_INTEREST_BRAND_ITEMS: UserBrandLike[] = [
  {
    brandId: 1,
    englishBrandName: "adidas",
    brandName: "아디다스",
    totalLikeCount: 60000,
    recentProductList: buildBrandProducts("A"),
  },
  {
    brandId: 2,
    englishBrandName: "Nike",
    brandName: "나이키",
    totalLikeCount: 120000,
    recentProductList: buildBrandProducts("B"),
  },
  {
    brandId: 3,
    englishBrandName: "NewBalance",
    brandName: "뉴발란스",
    totalLikeCount: 35000,
    recentProductList: buildBrandProducts("C"),
  },
  {
    brandId: 4,
    englishBrandName: "Puma",
    brandName: "푸마",
    totalLikeCount: 28000,
    recentProductList: buildBrandProducts("D"),
  },
];

export const MOCK_INTEREST_RECENT_ITEMS: UserRecentProduct[] = [
  {
    productItemId: 101,
    brandId: 1,
    brandName: "HERA",
    productName: "UV 프로텍터 톤업 SPF50+",
    imageUrl: "https://placehold.co/305x305/f4e2d8/333?text=01",
    price: 36000,
    like: 1240,
    review: 312,
    reviewAverage: 4.8,
  },
  {
    productItemId: 102,
    brandId: 1,
    brandName: "HERA",
    productName: "센슈얼 파우더 매트 립스틱",
    imageUrl: "https://placehold.co/305x305/f4b5b5/333?text=02",
    price: 40500,
    discountPrice: 35000,
    like: 980,
    review: 204,
    reviewAverage: 4.6,
  },
  {
    productItemId: 103,
    brandId: 2,
    brandName: "sulwhasoo",
    productName: "윤조 에센스 6세대",
    imageUrl: "https://placehold.co/305x305/e8d8c0/333?text=03",
    price: 130000,
    like: 5230,
    review: 1820,
    reviewAverage: 4.9,
  },
  {
    productItemId: 104,
    brandId: 3,
    brandName: "innisfree",
    productName: "그린티 씨드 세럼",
    imageUrl: "https://placehold.co/305x305/d4e8d0/333?text=04",
    price: 29000,
    like: 3110,
    review: 940,
    reviewAverage: 4.7,
  },
  {
    productItemId: 105,
    brandId: 4,
    brandName: "laneige",
    productName: "워터 슬리핑 마스크 EX",
    imageUrl: "https://placehold.co/305x305/cfe0f0/333?text=05",
    price: 34000,
    like: 4205,
    review: 1502,
    reviewAverage: 4.8,
  },
  {
    productItemId: 106,
    brandId: 1,
    brandName: "HERA",
    productName: "블랙 쿠션 SPF34",
    imageUrl: "https://placehold.co/305x305/e0e0e0/333?text=06",
    price: 58000,
    like: 2870,
    review: 760,
    reviewAverage: 4.5,
  },
  {
    productItemId: 107,
    brandId: 5,
    brandName: "AMUSE",
    productName: "듀 틴트 벨벳",
    imageUrl: "https://placehold.co/305x305/f0d0d8/333?text=07",
    price: 18000,
    discountPrice: 15300,
    like: 1530,
    review: 410,
    reviewAverage: 4.6,
  },
  {
    productItemId: 108,
    brandId: 6,
    brandName: "TIRTIR",
    productName: "마스크 핏 레드 쿠션",
    imageUrl: "https://placehold.co/305x305/f5cccc/333?text=08",
    price: 24000,
    like: 6120,
    review: 2230,
    reviewAverage: 4.9,
  },
];

// 임시 노출: dev 환경에서 API 응답이 비었을 때만 mock 으로 채워서 UI 확인용.
// production 빌드에서는 빈 응답이 그대로 Empty 상태로 보인다.
export const IS_DEV_MYPAGE_MOCK = process.env.NODE_ENV !== "production";
