import type {
  DetailOption,
  OptionType,
  OptionValue,
} from "@shared/services/product";

/**
 * 화면에 노출하는 축 순서.
 *
 * 서버 응답(`DetailOption`)의 키 순서에 의존하지 않기 위해 명시한다. JSON 키 순서는
 * 스펙상 보장되지 않고, 서버가 필드 순서를 바꾸면 화면 순서가 조용히 따라 흔들린다.
 */
export const OPTION_AXIS_ORDER: ReadonlyArray<OptionType> = [
  "COLOR",
  "SIZE",
  "VOLUME",
  "TEXTURE",
  "MATERIAL",
  "FIT",
  "STYLE",
];

/**
 * 축 라벨 i18n 키. 서버는 축 제목을 주지 않으므로 클라이언트에서 매핑한다.
 *
 * 매핑에 없는 축은 렌더하지 않는다 - raw 키(`MATERIAL`)가 그대로 화면에 뜨는 것을 막는다.
 */
export const OPTION_AXIS_LABEL_KEY: Record<OptionType, string> = {
  COLOR: "color",
  SIZE: "size",
  VOLUME: "volume",
  TEXTURE: "texture",
  MATERIAL: "material",
  FIT: "fit",
  STYLE: "style",
};

export interface ProductOptionAxis {
  type: OptionType;
  /** `useTranslations()` 에 그대로 넘길 flat 키 */
  labelKey: string;
  values: OptionValue[];
}

/**
 * 상품이 실제로 가진 축만 `OPTION_AXIS_ORDER` 순서로 돌려준다.
 * 값이 없는 축과 라벨 키가 없는 축은 제외된다.
 */
export const listProductOptionAxes = (
  option: DetailOption | undefined,
): ProductOptionAxis[] => {
  if (!option) return [];

  return OPTION_AXIS_ORDER.reduce<ProductOptionAxis[]>((acc, type) => {
    const values = option[type];
    const labelKey = OPTION_AXIS_LABEL_KEY[type];

    if (!values?.length || !labelKey) return acc;

    return [...acc, { type, labelKey, values }];
  }, []);
};

/**
 * 축의 값들을 한 줄로 잇는다. 값이 여러 개인 축은 `S/M/L` 처럼 슬래시로 나열한다.
 */
export const formatOptionAxisValues = (values: OptionValue[]): string =>
  values.map((value) => value.value).join("/");

/** 사용자가 골라야 하는 축(값 2개 이상)과 자동 확정되는 축(값 1개)으로 나눈 결과 */
export interface ProductOptionAxisSplit {
  /** 값이 2개 이상 — selectbox 로 노출한다 */
  selectable: ProductOptionAxis[];
  /** 값이 정확히 1개 — 노출하지 않고 조합에 그대로 포함한다 */
  fixed: ProductOptionAxis[];
  /**
   * `"selectable"` 이면 축을 전부 골라야 조합이 생긴다(의류).
   * `"fixed"` 면 고를 게 없어 조합 1개가 처음부터 존재하고 수량만 조작한다(화장품).
   */
  mode: "selectable" | "fixed";
}

/**
 * 축 이름이 아니라 **값 개수**로 나눈다.
 *
 * `SIZE` 존재를 기준으로 삼으면 색이 여러 개인데 사이즈가 없는 상품(립스틱)이
 * 고를 수 없는 상태가 된다. 값 개수 기준은 축이 늘어도 그대로 동작한다.
 */
export const splitProductOptionAxes = (
  option: DetailOption | undefined,
): ProductOptionAxisSplit => {
  const axes = listProductOptionAxes(option);
  const selectable = axes.filter((axis) => axis.values.length > 1);
  const fixed = axes.filter((axis) => axis.values.length === 1);

  return {
    selectable,
    fixed,
    mode: selectable.length > 0 ? "selectable" : "fixed",
  };
};
