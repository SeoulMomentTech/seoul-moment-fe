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
