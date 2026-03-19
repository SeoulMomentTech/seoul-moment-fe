import type { GetAdminBrandPromotionDetailResponse } from "@shared/services/brandPromotion";

import type {
  BannerFormValue,
  BrandPromotionFormInitialState,
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

export function getBrandPromotionInitialState(
  detail: GetAdminBrandPromotionDetailResponse,
): BrandPromotionFormInitialState {
  return {
    banners:
      detail.bannerList.length > 0
        ? detail.bannerList.map((banner) => {
            const titles = { ko: "", en: "", zh: "" };

            banner.language.forEach((item) => {
              titles[getLanguageCode(item.languageCode)] = item.title;
            });

            return {
              imagePath: banner.imageUrl,
              linkUrl: banner.linkUrl,
              mobileImagePath: banner.mobileImageUrl,
              titles,
            };
          })
        : [],
    events:
      detail.eventAndCouponList && detail.eventAndCouponList.length > 0
        ? detail.eventAndCouponList.map((eventItem) => {
            const titles = { ko: "", en: "", zh: "" };

            eventItem.event.language.forEach((item) => {
              titles[getLanguageCode(item.languageCode)] = item.title;
            });

            return {
              coupons: eventItem.coupon.map((coupon) => {
                const content = {
                  ko: { title: "", description: "" },
                  en: { title: "", description: "" },
                  zh: { title: "", description: "" },
                };

                coupon.language.forEach((item) => {
                  const code = getLanguageCode(item.languageCode);
                  content[code] = {
                    description: item.description,
                    title: item.title,
                  };
                });

                return {
                  content,
                  imagePath: coupon.imageUrl,
                };
              }),
              status: eventItem.event.status,
              titles,
            };
          })
        : [],
    notices:
      detail.noticeList && detail.noticeList.length > 0
        ? detail.noticeList.map((notice) => {
            const content = { ko: "", en: "", zh: "" };

            notice.language.forEach((item) => {
              content[getLanguageCode(item.languageCode)] = item.content;
            });

            return { content };
          })
        : [],
    popups:
      detail.popupList.length > 0
        ? detail.popupList.map((popup) => {
            const content = {
              ko: { title: "", description: "" },
              en: { title: "", description: "" },
              zh: { title: "", description: "" },
            };

            popup.language.forEach((item) => {
              const code = getLanguageCode(item.languageCode);
              content[code] = {
                description: item.description,
                title: item.title,
              };
            });

            return {
              address: popup.address,
              content,
              endDate: normalizeDateInputValue(popup.endDate),
              endTime: normalizeTimeInputValue(popup.endTime),
              imagePathList: popup.imageUrlList,
              isActive: popup.isActive,
              latitude: String(popup.latitude),
              longitude: String(popup.longitude),
              place: popup.place,
              startDate: normalizeDateInputValue(popup.startDate),
              startTime: normalizeTimeInputValue(popup.startTime),
            };
          })
        : [],
    sections:
      detail.sectionList.length > 0
        ? detail.sectionList.map((section) => ({
            imagePathList: section.imageUrlList,
            type: section.type,
          }))
        : [],
    values: {
      brandId: detail.brandDto.id,
      descriptions: {
        ko:
          detail.brandDto.language.find((item) => item.languageCode === "ko")
            ?.description ?? "",
        en:
          detail.brandDto.language.find((item) => item.languageCode === "en")
            ?.description ?? "",
        zh:
          detail.brandDto.language.find((item) => item.languageCode === "zh-TW")
            ?.description ?? "",
      },
      isActive: detail.isActive,
    },
  };
}
