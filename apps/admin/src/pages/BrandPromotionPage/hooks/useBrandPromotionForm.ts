import { useState } from "react";

import { LANGUAGE_LIST } from "@shared/constants/locale";
import type { PostAdminBrandPromotionRequest } from "@shared/services/brandPromotion";
import { stripImageDomain } from "@shared/utils/image";

import { EMPTY_VALUES } from "../constants/form";
import type {
  BannerFormValue,
  BrandPromotionFormValues,
  EventFormValue,
  NoticeFormValue,
  PopupFormValue,
  SectionFormValue,
} from "../types";
import {
  createEmptyBanner,
  createEmptyEvent,
  createEmptyNotice,
  createEmptyPopup,
  createEmptySection,
  getLanguageCode,
} from "../utils/form";

type TabId = "basic" | "banner" | "section" | "popup" | "notice" | "event";

interface UseBrandPromotionFormOptions {
  initialValues?: BrandPromotionFormValues;
}

export function useBrandPromotionForm({
  initialValues,
}: UseBrandPromotionFormOptions = {}) {
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [values, setValues] = useState<BrandPromotionFormValues>(
    initialValues ?? EMPTY_VALUES,
  );
  const [banners, setBanners] = useState<BannerFormValue[]>([
    createEmptyBanner(),
  ]);
  const [sections, setSections] = useState<SectionFormValue[]>([
    createEmptySection(),
  ]);
  const [popups, setPopups] = useState<PopupFormValue[]>([createEmptyPopup()]);
  const [notices, setNotices] = useState<NoticeFormValue[]>([
    createEmptyNotice(),
  ]);
  const [events, setEvents] = useState<EventFormValue[]>([createEmptyEvent()]);

  const hasText = (value: string) => value.trim().length > 0;

  const isBasicValid =
    Boolean(values.brandId) &&
    Object.values(values.descriptions).every(hasText);

  const isBannerValid = banners.every(
    (banner) =>
      hasText(banner.imagePath) &&
      hasText(banner.mobileImagePath) &&
      hasText(banner.linkUrl) &&
      Object.values(banner.titles).every(hasText),
  );

  const isSectionValid = sections.every(
    (section) => section.imagePathList.filter(Boolean).length > 0,
  );

  const isPopupValid = popups.every(
    (popup) =>
      hasText(popup.place) &&
      hasText(popup.address) &&
      hasText(popup.latitude) &&
      hasText(popup.longitude) &&
      hasText(popup.startDate) &&
      hasText(popup.startTime) &&
      hasText(popup.endTime) &&
      popup.imagePathList.filter(Boolean).length > 0 &&
      Object.values(popup.content).every(
        (content) => hasText(content.title) && hasText(content.description),
      ),
  );

  const isNoticeValid = notices.every((notice) =>
    Object.values(notice.content).every(hasText),
  );

  const isEventValid = events.every(
    (event) =>
      Object.values(event.titles).every(hasText) &&
      event.coupons.every(
        (coupon) =>
          hasText(coupon.imagePath) &&
          Object.values(coupon.content).every(
            (content) => hasText(content.title) && hasText(content.description),
          ),
      ),
  );

  const isSubmitEnabled =
    isBasicValid &&
    isBannerValid &&
    isSectionValid &&
    isPopupValid &&
    isNoticeValid &&
    isEventValid;

  const createPayload = (): PostAdminBrandPromotionRequest | null => {
    if (!values.brandId) {
      return null;
    }

    return {
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
      noticeList: notices.map((notice) => ({
        language: LANGUAGE_LIST.map((language) => ({
          languageId: language.id,
          content: notice.content[getLanguageCode(language.code)] ?? "",
        })),
      })),
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
    };
  };

  return {
    activeTab,
    banners,
    createPayload,
    events,
    isSubmitEnabled,
    notices,
    popups,
    sections,
    setActiveTab,
    setBanners,
    setEvents,
    setNotices,
    setPopups,
    setSections,
    setValues,
    values,
  };
}

export type BrandPromotionFormState = ReturnType<typeof useBrandPromotionForm>;
