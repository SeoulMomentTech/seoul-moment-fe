import type { ProductDetailOption } from "@shared/services/product";

/**
 * 화면에 내보내는 옵션 축과 그 순서·이름.
 *
 * 서버 응답의 키 순서에 기대지 않는다 — JSON 키 순서는 보장되지 않고, 서버가 필드 순서를
 * 바꾸면 화면 순서가 조용히 따라 흔들린다. 여기 없는 축(COUNTRY_OF_ORIGIN, GENDER …)은
 * 그리지 않는다. 날것의 키가 그대로 화면에 뜨는 것을 막는 쪽이 낫다.
 *
 * 웹 OPTION_AXIS_ORDER / OPTION_AXIS_LABEL_KEY 와 같은 목록·같은 순서다.
 */
export const OPTION_AXES: readonly (readonly [type: string, label: string])[] =
  [
    ["COLOR", "Color"],
    ["SIZE", "Size"],
    ["VOLUME", "Volume"],
    ["TEXTURE", "Texture"],
    ["MATERIAL", "Material"],
    ["FIT", "Fit"],
  ];

/** 상품이 실제로 가진 축만 위 순서대로. 값이 없는 축은 빠진다. */
export const listOptionAxes = (option: ProductDetailOption | undefined) =>
  OPTION_AXES.flatMap(([type, label]) => {
    const values = option?.[type];

    return values && values.length > 0 ? [{ type, label, values }] : [];
  });
