import type { CvsChain } from "@shared/services/logistics";
import type {
  UserOrderPaymentMethod,
  UserOrderShippingType,
} from "@shared/services/userOrder";

import type { OrderShippingValues } from "./schema";

export const ORDER_DRAFT_KEY = "order:draft";

/** 매장 토큰 수명과 같다. 그보다 오래된 입력은 매장도 만료라 함께 버린다 */
export const ORDER_DRAFT_TTL_MS = 60 * 60 * 1000;

/**
 * 전자지도로 떠나기 직전의 주문서 입력. 같은 탭으로 돌아왔을 때 이 값으로 복원한다.
 * 개인정보라 URL 이 아니라 sessionStorage 에 둔다.
 */
export interface OrderDraft {
  /** 어느 주문서의 임시값인지 (`toOrderHref(source)`). 다른 주문 대상이면 무시한다 */
  sourceHref: string;
  shippingMethod: UserOrderShippingType;
  home: { useDefaultShipping: boolean; values: OrderShippingValues };
  cvs: {
    chain: CvsChain | null;
    storeToken: string | null;
    recipientName: string;
    phone: string;
  };
  paymentMethod: UserOrderPaymentMethod;
  savedAt: number;
}

const storage = (): Storage | null => {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

/** 저장소가 없거나(프라이빗 모드 등) 가득 차도 조용히 넘어간다 — 지도 이동을 막지 않는다 */
export const saveOrderDraft = (draft: Omit<OrderDraft, "savedAt">) => {
  try {
    storage()?.setItem(
      ORDER_DRAFT_KEY,
      JSON.stringify({ ...draft, savedAt: Date.now() } satisfies OrderDraft),
    );
  } catch {
    // 저장 실패는 복원이 안 될 뿐이라 사용자를 막을 이유가 없다
  }
};

export const clearOrderDraft = () => {
  try {
    storage()?.removeItem(ORDER_DRAFT_KEY);
  } catch {
    // 지울 수 없으면 만료 판정이 다음 읽기에서 걸러낸다
  }
};

/** 있고 만료 전이면 돌려준다. 만료·손상이면 지우고 null */
export const peekOrderDraft = (): OrderDraft | null => {
  let raw: string | null = null;

  try {
    raw = storage()?.getItem(ORDER_DRAFT_KEY) ?? null;
  } catch {
    return null;
  }

  if (!raw) return null;

  try {
    const draft = JSON.parse(raw) as Partial<OrderDraft>;
    const isFresh =
      typeof draft.savedAt === "number" &&
      Date.now() - draft.savedAt <= ORDER_DRAFT_TTL_MS;

    if (!isFresh || !draft.sourceHref) {
      clearOrderDraft();
      return null;
    }

    return draft as OrderDraft;
  } catch {
    clearOrderDraft();
    return null;
  }
};

/** sourceHref 가 같은 draft 를 돌려주고 지운다. 다르면 건드리지 않고 null */
export const takeOrderDraft = (sourceHref: string): OrderDraft | null => {
  const draft = peekOrderDraft();

  if (!draft || draft.sourceHref !== sourceHref) return null;

  clearOrderDraft();
  return draft;
};
