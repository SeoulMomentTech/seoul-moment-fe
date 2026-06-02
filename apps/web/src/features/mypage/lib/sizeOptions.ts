export type SizeType = "shoes" | "outer" | "top" | "bottom";

export interface SizeFieldConfig {
  type: SizeType;
  labelKey: string;
  modalTitleKey: string;
  options: ReadonlyArray<string>;
}

function range(start: number, end: number, step: number): string[] {
  const result: string[] = [];
  for (let value = start; value <= end; value += step) {
    result.push(String(value));
  }
  return result;
}

const APPAREL_SIZES = [
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
] as const;

export const SIZE_FIELDS: ReadonlyArray<SizeFieldConfig> = [
  {
    type: "shoes",
    labelKey: "shoes",
    modalTitleKey: "my_shoes_size",
    options: range(220, 290, 5),
  },
  {
    type: "outer",
    labelKey: "outer_wear",
    modalTitleKey: "my_outerwear_size",
    options: APPAREL_SIZES,
  },
  {
    type: "top",
    labelKey: "tops",
    modalTitleKey: "my_top_size",
    options: APPAREL_SIZES,
  },
  {
    type: "bottom",
    labelKey: "bottoms",
    modalTitleKey: "my_bottom_size",
    options: range(23, 37, 1),
  },
];
