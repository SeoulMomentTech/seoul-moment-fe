import type { BrandPromotionFormValues, SectionType } from "../types";

export const TAB_ITEMS = [
  { id: "basic", label: "기본 정보" },
  { id: "banner", label: "배너" },
  { id: "section", label: "섹션" },
  { id: "popup", label: "팝업" },
  { id: "notice", label: "공지사항" },
  { id: "event", label: "이벤트&쿠폰" },
] as const;

export const EMPTY_VALUES: BrandPromotionFormValues = {
  brandId: undefined,
  isActive: true,
  descriptions: { ko: "", en: "", zh: "" },
};

export const SECTION_OPTIONS: Array<{ label: string; value: SectionType }> = [
  { label: "타입 1", value: "TYPE_1" },
  { label: "타입 2", value: "TYPE_2" },
  { label: "타입 3", value: "TYPE_3" },
  { label: "타입 4", value: "TYPE_4" },
  { label: "타입 5", value: "TYPE_5" },
];

export const FORM_INPUT_CLASS = "border-black/20 bg-white";
export const FORM_TEXTAREA_CLASS =
  "min-h-[88px] resize-none border-black/20 bg-white";
