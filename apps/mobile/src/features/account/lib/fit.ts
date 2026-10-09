import type { GetUserFitRes, UserFitPayload } from "@shared/services/user";
import { toChipOptions, type ChipOption } from "@shared/ui/chip-row";

function range(start: number, end: number, step: number): string[] {
  const result: string[] = [];
  for (let value = start; value <= end; value += step) {
    result.push(String(value));
  }
  return result;
}

const APPAREL_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export type SizeKey = "shoeSize" | "outerSize" | "topSize" | "bottomSize";

export interface SizeFieldConfig {
  key: SizeKey;
  label: string;
  options: ChipOption[];
  /** 숫자로 저장되는 칸(신발·하의)인지. 보기는 문자열이지만 payload 는 number 다. */
  numeric: boolean;
}

/** 보기와 순서는 web 의 SIZE_FIELDS 와 같다. */
export const SIZE_FIELDS: SizeFieldConfig[] = [
  {
    key: "shoeSize",
    label: "Shoes",
    options: toChipOptions(range(220, 290, 5)),
    numeric: true,
  },
  {
    key: "outerSize",
    label: "Outerwear",
    options: toChipOptions(APPAREL_SIZES),
    numeric: false,
  },
  {
    key: "topSize",
    label: "Tops",
    options: toChipOptions(APPAREL_SIZES),
    numeric: false,
  },
  {
    key: "bottomSize",
    label: "Bottoms",
    options: toChipOptions(range(23, 37, 1)),
    numeric: true,
  },
];

export const MAX_HEIGHT = 250;
export const MAX_WEIGHT = 300;

export interface FitFormValues {
  height: string;
  weight: string;
  /** 고르지 않은 칸은 키 자체가 없다. 그 "없음"이 저장할 때 null 이 된다. */
  sizes: Partial<Record<SizeKey, string>>;
}

export const EMPTY_FIT: FitFormValues = { height: "", weight: "", sizes: {} };

/** 숫자만 남기고 상한에서 자른다. web 의 clampNumeric 과 같은 규칙이다. */
export function clampNumeric(raw: string, max: number): string {
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return "";
  return String(Math.min(Number(digits), max));
}

export function fitToFormValues(fit: GetUserFitRes | null): FitFormValues {
  if (!fit) return EMPTY_FIT;

  return {
    height: fit.height == null ? "" : String(fit.height),
    weight: fit.weight == null ? "" : String(fit.weight),
    sizes: {
      ...(fit.shoeSize == null ? {} : { shoeSize: String(fit.shoeSize) }),
      ...(fit.outerSize ? { outerSize: fit.outerSize } : {}),
      ...(fit.topSize ? { topSize: fit.topSize } : {}),
      ...(fit.bottomSize ? { bottomSize: fit.bottomSize } : {}),
    },
  };
}

/** 비우는 칸은 생략이 아니라 null 로 보낸다 — 생략하면 서버가 옛 값을 남긴다. */
export function formValuesToFitPayload(values: FitFormValues): UserFitPayload {
  const { shoeSize, outerSize, topSize, bottomSize } = values.sizes;

  return {
    height: values.height === "" ? null : Number(values.height),
    weight: values.weight === "" ? null : Number(values.weight),
    shoeSize: shoeSize ? Number(shoeSize) : null,
    outerSize: outerSize ?? null,
    topSize: topSize ?? null,
    bottomSize: bottomSize ?? null,
  };
}

export const hasAnyFitValue = (values: FitFormValues) =>
  values.height !== "" ||
  values.weight !== "" ||
  SIZE_FIELDS.some((field) => Boolean(values.sizes[field.key]));

export const fitValuesEqual = (a: FitFormValues, b: FitFormValues) =>
  a.height === b.height &&
  a.weight === b.weight &&
  SIZE_FIELDS.every((field) => a.sizes[field.key] === b.sizes[field.key]);
