import type {
  BannerFormValue,
  CouponFormValue,
  EventFormValue,
  LanguageCode,
  NoticeFormValue,
  PopupFormValue,
  SectionFormValue,
} from "../types";

export const createEmptyBanner = (): BannerFormValue => ({
  imagePath: "",
  mobileImagePath: "",
  linkUrl: "",
  titles: { ko: "", en: "", zh: "" },
});

export const createEmptySection = (): SectionFormValue => ({
  type: "TYPE_1",
  imagePathList: [""],
});

export const createEmptyPopup = (): PopupFormValue => ({
  place: "",
  address: "",
  latitude: "0",
  longitude: "0",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  isActive: true,
  imagePathList: [""],
  content: {
    ko: { title: "", description: "" },
    en: { title: "", description: "" },
    zh: { title: "", description: "" },
  },
});

export const createEmptyNotice = (): NoticeFormValue => ({
  content: { ko: "", en: "", zh: "" },
});

export const createEmptyCoupon = (): CouponFormValue => ({
  imagePath: "",
  content: {
    ko: { title: "", description: "" },
    en: { title: "", description: "" },
    zh: { title: "", description: "" },
  },
});

export const createEmptyEvent = (): EventFormValue => ({
  status: "NORMAL",
  titles: { ko: "", en: "", zh: "" },
  coupons: [],
});

export function getLanguageCode(code: string): LanguageCode {
  if (code === "en") return "en";
  if (code === "zh" || code.startsWith("zh")) return "zh";
  return "ko";
}

export function getLanguageLabel(languageId: number) {
  if (languageId === 1) return "한국어";
  if (languageId === 2) return "영어";
  return "중국어";
}

export function normalizeDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const trimmedValue = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  const dateMatch = trimmedValue.match(/^(\d{4}-\d{2}-\d{2})/);
  return dateMatch?.[1] ?? "";
}

export function normalizeTimeInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const trimmedValue = value.trim();

  if (/^\d{2}:\d{2}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  const timeMatch = trimmedValue.match(/(\d{2}:\d{2})/);
  return timeMatch?.[1] ?? "";
}
