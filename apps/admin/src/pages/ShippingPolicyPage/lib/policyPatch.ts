import type { PatchAdminShippingPolicyRequest } from "@shared/services/shipping";

/** 이 화면에서 고치는 값. 배송비·외섬 설정은 여기서 건드리지 않는다 */
export interface EditablePolicy {
  freeShippingThreshold: number;
  internationalDiscountEnabled: boolean;
}

/**
 * PATCH 는 보낸 키만 바꾼다. 다른 관리자가 그 사이 바꾼 값을 덮지 않도록
 * 화면에서 실제로 바뀐 키만 보낸다.
 */
export const buildPolicyPatch = (
  saved: EditablePolicy,
  values: EditablePolicy,
): PatchAdminShippingPolicyRequest => {
  const patch: PatchAdminShippingPolicyRequest = {};

  if (values.freeShippingThreshold !== saved.freeShippingThreshold) {
    patch.freeShippingThreshold = values.freeShippingThreshold;
  }
  if (values.internationalDiscountEnabled !== saved.internationalDiscountEnabled) {
    patch.internationalDiscountEnabled = values.internationalDiscountEnabled;
  }

  return patch;
};
