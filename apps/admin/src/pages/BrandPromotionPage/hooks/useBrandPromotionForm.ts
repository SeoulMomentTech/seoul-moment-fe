import { useState } from "react";

import { LANGUAGE_LIST } from "@shared/constants/locale";
import type { PostAdminBrandPromotionRequest } from "@shared/services/brandPromotion";
import { stripImageDomain } from "@shared/utils/image";

import { EMPTY_VALUES } from "../constants/form";
import type {
  BannerFormValue,
  BrandPromotionFormInitialState,
  BrandPromotionFormValues,
  EventFormValue,
  NoticeFormValue,
  PopupFormValue,
  SectionFormValue,
} from "../types";
import {
  createEmptyBanner,
  createEmptyPopup,
  createEmptySection,
  getLanguageCode,
} from "../utils/form";
import {
  getBrandPromotionFormErrors,
  getIsBrandPromotionSubmitEnabled,
} from "../utils/validation";

type TabId = "basic" | "banner" | "section" | "popup" | "notice" | "event";

interface UseBrandPromotionFormOptions {
  initialState?: BrandPromotionFormInitialState;
}

export function useBrandPromotionForm({
  initialState,
}: UseBrandPromotionFormOptions = {}) {
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [values, setValues] = useState<BrandPromotionFormValues>(
    initialState?.values ?? EMPTY_VALUES,
  );
  const [banners, setBanners] = useState<BannerFormValue[]>([
    ...(initialState?.banners?.length
      ? initialState.banners
      : [createEmptyBanner()]),
  ]);
  const [sections, setSections] = useState<SectionFormValue[]>([
    ...(initialState?.sections?.length
      ? initialState.sections
      : [createEmptySection()]),
  ]);
  const [popups, setPopups] = useState<PopupFormValue[]>([
    ...(initialState?.popups?.length
      ? initialState.popups
      : [createEmptyPopup()]),
  ]);
  const [notices, setNotices] = useState<NoticeFormValue[]>([
    ...(initialState?.notices?.length
      ? initialState.notices
      : []),
  ]);
  const [events, setEvents] = useState<EventFormValue[]>([
    ...(initialState?.events?.length
      ? initialState.events
      : []),
  ]);

  const errors = getBrandPromotionFormErrors({
    banners,
    events,
    notices,
    popups,
    sections,
    values,
  });

  const isSubmitEnabled = getIsBrandPromotionSubmitEnabled({
    banners,
    events,
    notices,
    popups,
    sections,
    values,
  });

  const createPayload = (): PostAdminBrandPromotionRequest | null => {
    if (!values.brandId || !values.promotionId) {
      return null;
    }

    return {
      promotionId: values.promotionId,
      brandId: values.brandId,
      brandDescriptionLanguage: LANGUAGE_LIST.map((language) => ({
        description: values.descriptions[getLanguageCode(language.code)] ?? "",
        languageId: language.id,
      })),
      isActive: values.isActive,
      bannerList: banners.map((banner) => ({
        imagePath: stripImageDomain(banner.imagePath),
        mobileImagePath: stripImageDomain(banner.mobileImagePath),
        linkUrl: banner.linkUrl,
        language: LANGUAGE_LIST.map((language) => ({
          languageId: language.id,
          title: banner.titles[getLanguageCode(language.code)] ?? "",
        })),
      })),
      sectionList: sections.map((section) => ({
        ...section,
        imagePathList: section.imagePathList.map(stripImageDomain),
      })),
      popupList: popups.map((popup) => ({
        place: popup.place,
        address: popup.address,
        latitude: Number(popup.latitude) || 0,
        longitude: Number(popup.longitude) || 0,
        startDate: popup.startDate,
        startTime: popup.startTime,
        endDate: popup.endDate || undefined,
        endTime: popup.endTime,
        isActive: popup.isActive,
        imagePathList: popup.imagePathList
          .filter(Boolean)
          .map(stripImageDomain),
        language: LANGUAGE_LIST.map((language) => {
          const code = getLanguageCode(language.code);
          return {
            languageId: language.id,
            title: popup.content[code].title,
            description: popup.content[code].description,
          };
        }),
      })),
      ...(notices.length > 0 && {
        noticeList: notices.map((notice) => ({
          language: LANGUAGE_LIST.map((language) => ({
            languageId: language.id,
            content: notice.content[getLanguageCode(language.code)] ?? "",
          })),
        })),
      }),
      ...(events.length > 0 && {
        eventAndCouponList: events.map((event) => ({
          event: {
            status: event.status,
            language: LANGUAGE_LIST.map((language) => ({
              languageId: language.id,
              title: event.titles[getLanguageCode(language.code)] ?? "",
            })),
          },
          coupon: event.coupons.map((coupon) => ({
            imagePath: stripImageDomain(coupon.imagePath),
            language: LANGUAGE_LIST.map((language) => {
              const code = getLanguageCode(language.code);
              return {
                languageId: language.id,
                title: coupon.content[code].title,
                description: coupon.content[code].description,
              };
            }),
          })),
        })),
      }),
    };
  };

  return {
    activeTab,
    banners,
    createPayload,
    errors,
    events,
    isSubmitEnabled,
    isSubmitAttempted,
    notices,
    popups,
    sections,
    setActiveTab,
    setBanners,
    setEvents,
    setNotices,
    setPopups,
    setSections,
    setIsSubmitAttempted,
    setValues,
    values,
  };
}

export type BrandPromotionFormState = ReturnType<typeof useBrandPromotionForm>;
