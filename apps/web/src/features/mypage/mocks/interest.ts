import type {
  UserBrandLike,
  UserBrandLikeProduct,
  UserProductLike,
} from "@shared/services/userLike";

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

// 임시 노출: dev 환경에서 API 응답이 비었을 때만 mock 으로 채워서 UI 확인용.
// production 빌드에서는 빈 응답이 그대로 Empty 상태로 보인다.
export const IS_DEV_MYPAGE_MOCK = process.env.NODE_ENV !== "production";
