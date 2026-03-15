import type {
  BannerFormValue,
  BrandPromotionFormErrors,
  BrandPromotionFormValues,
  EventFormValue,
  NoticeFormValue,
  PopupFormValue,
  SectionFormValue,
} from "../types";

const hasText = (value: string) => (value ?? "").trim().length > 0;

const isValidHttpUrl = (value: string) => {
  if (!hasText(value)) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export function getBrandPromotionFormErrors({
  banners,
  events,
  notices,
  popups,
  sections,
  values,
}: {
  banners: BannerFormValue[];
  events: EventFormValue[];
  notices: NoticeFormValue[];
  popups: PopupFormValue[];
  sections: SectionFormValue[];
  values: BrandPromotionFormValues;
}): BrandPromotionFormErrors {
  return {
    banners: banners.map((banner) => ({
      imagePath: hasText(banner.imagePath)
        ? undefined
        : "PC 이미지를 업로드해주세요.",
      linkUrl: !hasText(banner.linkUrl)
        ? "링크 URL을 입력해주세요."
        : isValidHttpUrl(banner.linkUrl)
          ? undefined
          : "올바른 URL 형식을 입력해주세요.",
      mobileImagePath: hasText(banner.mobileImagePath)
        ? undefined
        : "모바일 이미지를 업로드해주세요.",
      titles: {
        ko: hasText(banner.titles.ko)
          ? undefined
          : "한국어 제목을 입력해주세요.",
        en: hasText(banner.titles.en) ? undefined : "영어 제목을 입력해주세요.",
        zh: hasText(banner.titles.zh)
          ? undefined
          : "중국어 제목을 입력해주세요.",
      },
    })),
    events: events.map((event) => ({
      coupons: event.coupons.map((coupon) => ({
        content: {
          ko: {
            title: hasText(coupon.content.ko.title)
              ? undefined
              : "한국어 제목을 입력해주세요.",
            description: hasText(coupon.content.ko.description)
              ? undefined
              : "한국어 설명을 입력해주세요.",
          },
          en: {
            title: hasText(coupon.content.en.title)
              ? undefined
              : "영어 제목을 입력해주세요.",
            description: hasText(coupon.content.en.description)
              ? undefined
              : "영어 설명을 입력해주세요.",
          },
          zh: {
            title: hasText(coupon.content.zh.title)
              ? undefined
              : "중국어 제목을 입력해주세요.",
            description: hasText(coupon.content.zh.description)
              ? undefined
              : "중국어 설명을 입력해주세요.",
          },
        },
        imagePath: hasText(coupon.imagePath)
          ? undefined
          : "쿠폰 이미지를 업로드해주세요.",
      })),
      titles: {
        ko: hasText(event.titles.ko)
          ? undefined
          : "한국어 제목을 입력해주세요.",
        en: hasText(event.titles.en) ? undefined : "영어 제목을 입력해주세요.",
        zh: hasText(event.titles.zh)
          ? undefined
          : "중국어 제목을 입력해주세요.",
      },
    })),
    notices: notices.map((notice) => ({
      content: {
        ko: hasText(notice.content.ko)
          ? undefined
          : "한국어 내용을 입력해주세요.",
        en: hasText(notice.content.en)
          ? undefined
          : "영어 내용을 입력해주세요.",
        zh: hasText(notice.content.zh)
          ? undefined
          : "중국어 내용을 입력해주세요.",
      },
    })),
    popups: popups.map((popup) => ({
      address: hasText(popup.address) ? undefined : "주소를 입력해주세요.",
      content: {
        ko: {
          title: hasText(popup.content.ko.title)
            ? undefined
            : "한국어 제목을 입력해주세요.",
          description: hasText(popup.content.ko.description)
            ? undefined
            : "한국어 설명을 입력해주세요.",
        },
        en: {
          title: hasText(popup.content.en.title)
            ? undefined
            : "영어 제목을 입력해주세요.",
          description: hasText(popup.content.en.description)
            ? undefined
            : "영어 설명을 입력해주세요.",
        },
        zh: {
          title: hasText(popup.content.zh.title)
            ? undefined
            : "중국어 제목을 입력해주세요.",
          description: hasText(popup.content.zh.description)
            ? undefined
            : "중국어 설명을 입력해주세요.",
        },
      },
      endTime: hasText(popup.endTime) ? undefined : "종료 시간을 입력해주세요.",
      imagePathList:
        popup.imagePathList.filter(Boolean).length > 0
          ? undefined
          : "팝업 이미지를 업로드해주세요.",
      latitude: hasText(popup.latitude) ? undefined : "위도를 입력해주세요.",
      longitude: hasText(popup.longitude) ? undefined : "경도를 입력해주세요.",
      place: hasText(popup.place) ? undefined : "장소를 입력해주세요.",
      startDate: hasText(popup.startDate)
        ? undefined
        : "시작 날짜를 입력해주세요.",
      startTime: hasText(popup.startTime)
        ? undefined
        : "시작 시간을 입력해주세요.",
    })),
    sections: sections.map((section) => ({
      imagePathList:
        section.imagePathList.filter(Boolean).length > 0
          ? undefined
          : "섹션 이미지를 업로드해주세요.",
    })),
    values: {
      brandId: values.brandId ? undefined : "브랜드를 선택해주세요.",
      descriptions: {
        ko: hasText(values.descriptions.ko)
          ? undefined
          : "한국어 설명을 입력해주세요.",
        en: hasText(values.descriptions.en)
          ? undefined
          : "영어 설명을 입력해주세요.",
        zh: hasText(values.descriptions.zh)
          ? undefined
          : "중국어 설명을 입력해주세요.",
      },
    },
  };
}

export function getIsBrandPromotionSubmitEnabled({
  banners,
  events,
  notices,
  popups,
  sections,
  values,
}: {
  banners: BannerFormValue[];
  events: EventFormValue[];
  notices: NoticeFormValue[];
  popups: PopupFormValue[];
  sections: SectionFormValue[];
  values: BrandPromotionFormValues;
}) {
  const isBasicValid =
    Boolean(values.brandId) &&
    Object.values(values.descriptions).every(hasText);

  const isBannerValid = banners.every(
    (banner) =>
      hasText(banner.imagePath) &&
      hasText(banner.mobileImagePath) &&
      isValidHttpUrl(banner.linkUrl) &&
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

  return (
    isBasicValid &&
    isBannerValid &&
    isSectionValid &&
    isPopupValid &&
    isNoticeValid &&
    isEventValid
  );
}
