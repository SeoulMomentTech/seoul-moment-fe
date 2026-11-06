import type { CvsChain, CvsStore } from "@shared/services/logistics";
import type {
  UserOrderItem,
  UserOrderPreviewBrandGroup,
  UserOrderStatus,
} from "@shared/services/userOrder";

import { getCvsChainLabel } from "./cvsChain";

export const ORDER_STATUS_KEY: Record<UserOrderStatus, string> = {
  PENDING: "order_status_pending",
  PAYMENT_WAITING: "order_status_payment_waiting",
  PAID: "order_status_paid",
  CANCELED: "order_status_canceled",
  FAILED: "order_status_failed",
};

/**
 * 결제 전 주문만 다시 결제할 수 있다. 입금 대기 중에는 서버가 결제 시작을 409 로 막고,
 * 완료·취소·실패(환불 대상)는 다시 결제할 대상이 아니다.
 */
export const canRepay = (status: UserOrderStatus): boolean =>
  status === "PENDING";

/**
 * 주문 라인을 주문서의 라인 목록(`OrderItemList`)이 받는 브랜드 묶음으로 옮긴다. 주문 시점
 * 스냅샷이라 재고·품절 같은 장바구니 필드는 의미가 없어 기본값으로 둔다. 브랜드는 처음 나온
 * 순서를 지킨다.
 */
export const toOrderItemGroups = (
  items: ReadonlyArray<UserOrderItem>,
): UserOrderPreviewBrandGroup[] => {
  const groups = new Map<number, UserOrderPreviewBrandGroup>();

  for (const item of items) {
    const group = groups.get(item.brandId) ?? {
      brandId: item.brandId,
      brandName: item.brandName,
      brandProfileImage: "",
      productAmount: 0,
      items: [],
    };

    group.items.push({
      cartItemId: null,
      productItemId: item.productItemId,
      // 라인 목록이 key 로 쓴다. 주문 라인에는 SKU id 가 없어 라인 id 로 대신한다
      productVariantId: item.orderItemId,
      productName: item.productName,
      optionText: item.optionText,
      imageUrl: item.imageUrl,
      price: item.unitPrice,
      discountPrice: item.unitDiscountPrice,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      stockQuantity: 0,
      isSoldOut: false,
      isAvailable: true,
    });
    group.productAmount += item.totalPrice;
    groups.set(item.brandId, group);
  }

  return [...groups.values()];
};

const CVS_CHAIN_PREFIXES: ReadonlyArray<CvsChain> = [
  "UNIMART",
  "FAMI",
  "HILIFE",
];

/**
 * 주문 상세의 편의점 매장 표기. 응답 매장에는 체인 필드가 없고 ECPay `logisticsSubType`
 * (예: `UNIMARTC2C`)만 있어 그 접두로 체인을 읽는다. 없거나 모르는 값이면 매장명만.
 */
export const toCvsStoreLabel = (
  store: Pick<CvsStore, "storeName"> & { logisticsSubType?: string | null },
): string => {
  const chain = CVS_CHAIN_PREFIXES.find((prefix) =>
    store.logisticsSubType?.startsWith(prefix),
  );

  return chain
    ? `${getCvsChainLabel(chain)} ${store.storeName}`
    : store.storeName;
};
