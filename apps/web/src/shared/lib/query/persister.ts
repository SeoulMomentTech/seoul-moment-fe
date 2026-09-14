import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import type { Query } from "@tanstack/react-query";

/** localStorage 키. 예전 zustand 장바구니(`user-cart`)와 이름이 겹치지 않게 둔다 */
export const QUERY_CACHE_KEY = "query-cache";

/**
 * 이보다 오래된 저장물은 복원하지 않는다. 장바구니는 재고·가격이 서버에서 바뀌므로
 * 복원 직후 refetch 가 돈다 해도, 첫 페인트에 보일 수 있는 값의 나이는 제한한다.
 */
export const QUERY_CACHE_MAX_AGE = 1000 * 60 * 60 * 24;

/** 저장 포맷이 바뀌면 올린다. 값이 달라지면 기존 저장물은 폐기된다 */
export const QUERY_CACHE_BUSTER = "v1";

/**
 * 쿼리 캐시를 localStorage 에 남긴다.
 *
 * 새로고침 직후 서버 응답이 오기 전까지 빈 장바구니를 그리면 화면이 깜박인다. 예전에는
 * zustand persist 로컬 카트가 그 자리를 메웠지만, 서버가 단일 진실 원천이 된 뒤로는
 * 쿼리 캐시 자체를 복원하는 편이 맞다 — 사본이 하나 줄고 두 세계의 동기화도 사라진다.
 *
 * SSR 에는 localStorage 가 없다. `storage` 가 `undefined` 면 라이브러리가 아무것도 하지
 * 않는 persister 를 만들어 주므로 분기 없이 그대로 넘긴다.
 */
export const queryPersister = createSyncStoragePersister({
  key: QUERY_CACHE_KEY,
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  throttleTime: 1000,
});

/**
 * `useAppQuery({ persist: true })` 로 표시한 쿼리만 저장한다.
 *
 * 쿼리 키로 걸러내면 shared 가 도메인 키를 알아야 해서 FSD 역방향 참조가 된다. 표식을
 * 쿼리 쪽에서 붙이게 두면 shared 는 도메인을 몰라도 된다. 전부 저장하지 않는 이유는
 * 용량이다 — 상품 목록·상세는 매번 다시 읽어도 되는 값이다.
 */
export const shouldPersistQuery = (query: Query): boolean =>
  query.state.status === "success" && query.meta?.persist === true;
