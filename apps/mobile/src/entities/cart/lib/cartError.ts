import { HTTPError } from "ky";

/**
 * 재고 부족. 수량을 재고보다 크게 올리면 서버가 409 로 거절한다.
 *
 * 이 실패만 문구가 다르다 — "다시 해 보세요"는 틀린 말이다. 같은 수량으로 다시 눌러도
 * 똑같이 거절당한다. 거절 직후 목록을 다시 읽으므로 스테퍼의 상한도 함께 고쳐진다.
 */
export const isNotEnoughStockError = (error: unknown): boolean =>
  error instanceof HTTPError && error.response.status === 409;
