export type SizeType = "shoes" | "outer" | "top" | "bottom";

export interface SizeFieldConfig {
  type: SizeType;
  label: string;
  modalTitle: string;
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
    label: "신발",
    modalTitle: "내 신발 사이즈",
    options: range(220, 290, 5),
  },
  {
    type: "outer",
    label: "아우터",
    modalTitle: "내 아우터 사이즈",
    options: APPAREL_SIZES,
  },
  {
    type: "top",
    label: "상의",
    modalTitle: "내 상의 사이즈",
    options: APPAREL_SIZES,
  },
  {
    type: "bottom",
    label: "하의",
    modalTitle: "내 하의 사이즈",
    options: range(23, 37, 1),
  },
];
