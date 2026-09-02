// 이 파일은 자동 생성됩니다. 직접 수정하지 마세요.
// 재생성: pnpm option:sync  (GET /product/option)

export const OPTION_TYPES = [
  "COLOR",
  "COUNTRY_OF_ORIGIN",
  "FIT",
  "GENDER",
  "MATERIAL",
  "PACKAGE_SIZE",
  "PACKAGING_TYPE",
  "SIZE",
  "SKIN_TYPE",
  "TEXTURE",
  "VOLUME",
] as const;

export type OptionType = (typeof OPTION_TYPES)[number];
