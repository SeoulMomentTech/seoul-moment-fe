import type { PostAdminBrandPromotionSectionBaseDto } from "@shared/services/brandPromotion";

export type LanguageCode = "ko" | "en" | "zh";
export type SectionType = PostAdminBrandPromotionSectionBaseDto["type"];
export type EventStatus = "NORMAL" | "DELETE";

export interface BrandPromotionFormValues {
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
