import { getErrorInfo } from "@shared/lib/utils/error";

/**
 * 재고 부족 응답인지.
 *
 * 본문은 `Not enough stock. available: 1, requested: 2` 처럼 영문 free-text 라 파싱하지
 * 않는다 — 서버가 문구를 다듬으면 조용히 깨지고, 그대로 사용자에게 보여줄 수도 없다.
 * `code` 도 `CONFLICT` 로 범용이라 신호가 약하다.
 *
 * 장바구니 담기(`POST user/cart`)와 수량 변경(`PATCH user/cart/{id}`)의 409 는 스웨거상
 * `Not enough stock` 하나뿐이므로, 이 두 호출에 한해 status 만으로 판정한다.
 */
export const isNotEnoughStockError = (error: unknown): boolean =>
  getErrorInfo(error).status === 409;

/**
 * 게스트 장바구니가 사라졌는지.
 *
 * 서버 보관은 7일이라 헤더의 ID 가 살아 있어도 카트가 없을 수 있다. 그 상태로 계속
 * 요청하면 모든 조작이 조용히 실패하므로, 404 를 만나면 ID 를 버리고 빈 카트로 돌아간다.
 */
export const isGuestCartGoneError = (error: unknown): boolean =>
  getErrorInfo(error).status === 404;
