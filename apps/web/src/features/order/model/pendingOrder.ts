import type { PostUserOrderPreviewRes } from "@shared/services/userOrder";

import type { CreateUserOrderVariables } from "@entities/order";

export const PENDING_ORDER_KEY = "order:pending";

/** 서버가 결제 없는 PENDING 주문을 닫는 시간. 그 뒤 기억한 주문은 결제 시작이 409 다 */
export const PENDING_ORDER_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * 결제창으로 떠나기 전에 만든 PENDING 주문. 결제창에서 이탈해 같은 주문서로 돌아와
 * 같은 입력으로 다시 누르면, 새 주문을 만들지 않고 이 주문으로 결제 시작만 다시 부른다.
 */
export interface PendingOrder {
  /** 어느 주문서의 주문인지 (`toOrderHref(source)`) */
  sourceHref: string;
  /** 주문 생성 body + 미리보기 스냅샷. 하나라도 바뀌면 다른 주문이다 */
  bodyKey: string;
  orderId: number;
  orderNumber: string;
  totalAmount: number;
  /** 결제 시작 응답의 토큰. 결과 페이지(`?h=`)를 여는 열쇠 */
  resultToken?: string;
  savedAt: number;
}

/**
 * 주문 생성 body 에는 장바구니 라인의 수량·금액이 없다(장바구니 id 만 있다). 결제창에서
 * 이탈해 장바구니 수량을 고치고 돌아오면 body 는 같아도 다른 주문이어야 하므로, 미리보기의
 * 라인(`productVariantId:quantity`, 정렬)과 합계를 키에 함께 넣는다.
 */
export const toPendingBodyKey = (
  body: CreateUserOrderVariables,
  preview: PostUserOrderPreviewRes,
): string => {
  const lines = preview.brandGroups
    .flatMap((group) =>
      group.items.map((item) => `${item.productVariantId}:${item.quantity}`),
    )
    .sort();

  return JSON.stringify({ body, lines, totalAmount: preview.totalAmount });
};

const storage = (): Storage | null => {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

const read = (): PendingOrder | null => {
  const raw = storage()?.getItem(PENDING_ORDER_KEY);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") throw new Error("not an object");

    const order = parsed as PendingOrder;
    if (Date.now() - order.savedAt > PENDING_ORDER_TTL_MS) {
      clearPendingOrder();

      return null;
    }

    return order;
  } catch {
    clearPendingOrder();

    return null;
  }
};

/** 저장이 안 되면(프라이빗 모드 등) 중복 주문이 생길 뿐이다 — 서버가 24시간 뒤 닫는다 */
export const savePendingOrder = (order: Omit<PendingOrder, "savedAt">) => {
  try {
    storage()?.setItem(
      PENDING_ORDER_KEY,
      JSON.stringify({ ...order, savedAt: Date.now() } satisfies PendingOrder),
    );
  } catch {
    // 저장 실패는 다음 클릭이 새 주문을 만들 뿐이라 사용자를 막을 이유가 없다
  }
};

/** 같은 주문서·같은 입력의 살아 있는 주문. 만료·손상은 지우고 null */
export const findPendingOrder = (
  sourceHref: string,
  bodyKey: string,
): PendingOrder | null => {
  const order = read();
  if (!order) return null;

  return order.sourceHref === sourceHref && order.bodyKey === bodyKey
    ? order
    : null;
};

export const updatePendingOrder = (
  patch: Partial<Pick<PendingOrder, "resultToken">>,
) => {
  const order = read();
  if (!order) return;

  try {
    storage()?.setItem(
      PENDING_ORDER_KEY,
      JSON.stringify({ ...order, ...patch } satisfies PendingOrder),
    );
  } catch {
    // 토큰을 못 적어도 결제 시작 응답이 같은 값을 다시 준다
  }
};

export const clearPendingOrder = () => {
  try {
    storage()?.removeItem(PENDING_ORDER_KEY);
  } catch {
    // 지울 수 없으면 만료 판정이 다음 읽기에서 걸러낸다
  }
};
