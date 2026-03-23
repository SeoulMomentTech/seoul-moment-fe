import type { PostAdminBrandPromotionSectionBaseDto } from "@shared/services/brandPromotion";

export type LanguageCode = "ko" | "en" | "zh";
export type SectionType = PostAdminBrandPromotionSectionBaseDto["type"];
export type EventStatus = "NORMAL" | "DELETE";

export interface BrandPromotionFormValues {
  promotionId?: number;
  brandId?: number;
  isActive: boolean;
  descriptions: Record<LanguageCode, string>;
}

export interface BannerFormValue {
  imagePath: string;
  mobileImagePath: string;
  linkUrl: string;
  titles: Record<LanguageCode, string>;
}

export interface SectionFormValue {
  type: SectionType;
  imagePathList: string[];
}

export interface PopupFormValue {
  place: string;
  address: string;
  latitude: string;
  longitude: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isActive: boolean;
  imagePathList: string[];
  content: Record<LanguageCode, { title: string; description: string }>;
}

export interface NoticeFormValue {
  content: Record<LanguageCode, string>;
}

export interface CouponFormValue {
  imagePath: string;
  content: Record<LanguageCode, { title: string; description: string }>;
}

export interface EventFormValue {
  status: EventStatus;
  titles: Record<LanguageCode, string>;
  coupons: CouponFormValue[];
}

export interface BrandPromotionFormInitialState {
  banners?: BannerFormValue[];
  events?: EventFormValue[];
  notices?: NoticeFormValue[];
  popups?: PopupFormValue[];
  sections?: SectionFormValue[];
  values?: BrandPromotionFormValues;
}

export interface BrandPromotionFormErrors {
  banners: Array<{
    imagePath?: string;
    linkUrl?: string;
    mobileImagePath?: string;
    titles: Partial<Record<LanguageCode, string>>;
  }>;
  events: Array<{
    coupons: Array<{
      content: Partial<
        Record<LanguageCode, { description?: string; title?: string }>
      >;
      imagePath?: string;
    }>;
    titles: Partial<Record<LanguageCode, string>>;
  }>;
  notices: Array<{
    content: Partial<Record<LanguageCode, string>>;
  }>;
  popups: Array<{
    address?: string;
    content: Partial<
      Record<LanguageCode, { description?: string; title?: string }>
    >;
    endTime?: string;
    imagePathList?: string;
    latitude?: string;
    longitude?: string;
    place?: string;
    startDate?: string;
    startTime?: string;
  }>;
  sections: Array<{
    imagePathList?: string;
  }>;
  values: {
    promotionId?: string;
    brandId?: string;
    descriptions: Partial<Record<LanguageCode, string>>;
  };
}
