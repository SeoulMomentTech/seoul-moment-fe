import type {
  AiConsultAnswerTag,
  AiConsultBrand,
  AiConsultCategory,
} from "@shared/services/aiConsult";

export interface ChatbotMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  /**
   * 봇 메시지에만 존재한다. 렌더가 이 값에 따라 갈리므로(문의 링크·되묻기 칩)
   * 메시지 단위로 보관한다.
   */
  tag?: AiConsultAnswerTag;
  /** 되묻기 칩. 비어 있지 않으면 tag 와 무관하게 노출한다. */
  suggestions?: string[];
  /** 입점 브랜드 목록. BRAND_LIST 에서만 채워진다. */
  brands?: AiConsultBrand[];
  /** 카테고리 목록. CATEGORY_LIST 는 대분류, PRODUCT_CATEGORY_LIST 는 소분류. */
  categories?: AiConsultCategory[];
  /** 소분류 목록의 상위 대분류. PRODUCT_CATEGORY_LIST 에서만 채워진다. */
  parentCategory?: AiConsultCategory | null;
  /** 네트워크·서버 오류로 전송이 실패한 사용자 메시지 */
  failed?: boolean;
}

/** 문의 폼 링크를 노출할 tag. 서버가 링크를 주지 않으므로 프론트가 판단한다. */
export const CONTACT_LINK_TAGS: AiConsultAnswerTag[] = [
  "FALLBACK",
  "OFF_TOPIC",
  "UNAVAILABLE",
];

/** 정상 답변과 시각적으로 구분해야 하는 tag */
export const WARNING_TAGS: AiConsultAnswerTag[] = ["UNAVAILABLE"];

/**
 * 목록 항목이 이동할 목적지.
 *
 * 대분류(`categoryId`)와 소분류(`productCategoryId`)는 상품 목록에서 **서로 다른
 * 쿼리 파라미터**다(`features/product/model/useProductFilter.ts`). 같은 이름으로
 * 보내면 필터가 걸리지 않으므로 tag 로 갈라야 한다.
 */
export const entityHref = (
  tag: AiConsultAnswerTag | undefined,
  id: number,
): string => {
  if (tag === "BRAND_LIST") return `/brand/${id}`;
  if (tag === "PRODUCT_CATEGORY_LIST")
    return `/product?productCategoryId=${id}`;
  return `/product?categoryId=${id}`;
};

/**
 * 접힌 상태에서 노출할 항목 수.
 *
 * 실제 응답은 브랜드 8개·소분류 9개를 주는데 전부 세로로 나열하면 좁은 패널에서
 * 목록이 대화를 밀어낸다. 나머지는 목록 안의 펼치기 버튼으로 연다(PRD §5.2).
 */
export const ENTITY_LIST_VISIBLE_MAX = 5;
