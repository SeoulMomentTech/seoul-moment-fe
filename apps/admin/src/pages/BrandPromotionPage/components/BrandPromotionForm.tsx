import { useState } from "react";

import { useNavigate } from "react-router";

import { ArrowLeft } from "lucide-react";

import { useAdminBrandListQuery } from "@pages/BrandPage/ListPage/hooks";
import { LANGUAGE_LIST } from "@shared/constants/locale";
import { PATH } from "@shared/constants/route";
import type { PostAdminBrandPromotionRequest } from "@shared/services/brandPromotion";
import { stripImageDomain } from "@shared/utils/image";

import { Button } from "@seoul-moment/ui";

import { EMPTY_VALUES, TAB_ITEMS } from "../constants/form";
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
  createEmptyCoupon,
  createEmptyEvent,
  createEmptyNotice,
  createEmptyPopup,
  createEmptySection,
  getLanguageCode,
} from "../utils/form";
import { BannerSection } from "./sections/BannerSection";
import { BasicInfoSection } from "./sections/BasicInfoSection";
import { EventSection } from "./sections/EventSection";
import { NoticeSection } from "./sections/NoticeSection";
import { PopupSection } from "./sections/PopupSection";
import { SectionListSection } from "./sections/SectionListSection";

interface BrandPromotionFormProps {
  title: string;
  description: string;
  submitLabel: string;
  initialValues?: BrandPromotionFormValues;
  isLoading?: boolean;
  onSubmit?(payload: PostAdminBrandPromotionRequest): Promise<void> | void;
}

export function BrandPromotionForm({
  title,
  description,
  submitLabel,
  initialValues,
  isLoading = false,
  onSubmit,
}: BrandPromotionFormProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] =
    useState<(typeof TAB_ITEMS)[number]["id"]>("basic");
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

  const { data: brandResponse, isLoading: isBrandLoading } =
    useAdminBrandListQuery({
      page: 1,
      count: 100,
      searchColumn: "name",
      sort: "DESC",
    });

  const brandOptions =
    brandResponse?.data.list.map((brand) => ({
      value: String(brand.id),
      label:
        brand.nameDto.find((item) => item.languageCode === "ko")?.name ??
        `ID ${brand.id}`,
    })) ?? [];

  const handleSubmit = () => {
    if (!onSubmit || !values.brandId) {
      return;
    }

    onSubmit({
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
    });
  };

  return (
    <div className="p-8 pt-24">
      <div className="mx-auto max-w-[1200px]">
        <Button
          className="-ml-2 mb-4 gap-2 px-2"
          onClick={() => navigate(PATH.BRAND_PROMOTION)}
          variant="ghost"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로 돌아가기
        </Button>

        <div className="mb-6">
          <h2 className="text-title-4 mb-2 font-semibold">{title}</h2>
          <p className="text-sm text-black/60">{description}</p>
        </div>

        <div className="mb-6 grid grid-cols-6 rounded-[14px] bg-[#ececf1] p-1">
          {TAB_ITEMS.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                className={`rounded-[12px] px-3 py-[10px] text-sm font-medium transition ${isActive ? "bg-white text-black shadow-sm" : "text-black/80"
                  }`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-[16px] border border-black/10 bg-white px-5 py-5">
          {activeTab === "basic" && (
            <BasicInfoSection
              brandOptions={brandOptions}
              isBrandLoading={isBrandLoading}
              onChange={setValues}
              values={values}
            />
          )}
          {activeTab === "banner" && (
            <BannerSection
              banners={banners}
              onAdd={() =>
                setBanners((current) => [...current, createEmptyBanner()])
              }
              onChange={(index, nextValue) =>
                setBanners((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? nextValue : item,
                  ),
                )
              }
              onRemove={(index) =>
                setBanners((current) =>
                  current.length === 1
                    ? current
                    : current.filter((_, itemIndex) => itemIndex !== index),
                )
              }
            />
          )}
          {activeTab === "section" && (
            <SectionListSection
              onAdd={() =>
                setSections((current) => [...current, createEmptySection()])
              }
              onChange={(index, nextValue) =>
                setSections((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? nextValue : item,
                  ),
                )
              }
              onRemove={(index) =>
                setSections((current) =>
                  current.length === 1
                    ? current
                    : current.filter((_, itemIndex) => itemIndex !== index),
                )
              }
              sections={sections}
            />
          )}
          {activeTab === "popup" && (
            <PopupSection
              onAdd={() =>
                setPopups((current) => [...current, createEmptyPopup()])
              }
              onChange={(index, nextValue) =>
                setPopups((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? nextValue : item,
                  ),
                )
              }
              onRemove={(index) =>
                setPopups((current) =>
                  current.length === 1
                    ? current
                    : current.filter((_, itemIndex) => itemIndex !== index),
                )
              }
              popups={popups}
            />
          )}
          {activeTab === "notice" && (
            <NoticeSection
              notices={notices}
              onAdd={() =>
                setNotices((current) => [...current, createEmptyNotice()])
              }
              onChange={(index, nextValue) =>
                setNotices((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? nextValue : item,
                  ),
                )
              }
              onRemove={(index) =>
                setNotices((current) =>
                  current.length === 1
                    ? current
                    : current.filter((_, itemIndex) => itemIndex !== index),
                )
              }
            />
          )}
          {activeTab === "event" && (
            <EventSection
              createCoupon={createEmptyCoupon}
              events={events}
              onAdd={() =>
                setEvents((current) => [...current, createEmptyEvent()])
              }
              onChange={(index, nextValue) =>
                setEvents((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? nextValue : item,
                  ),
                )
              }
              onRemove={(index) =>
                setEvents((current) =>
                  current.length === 1
                    ? current
                    : current.filter((_, itemIndex) => itemIndex !== index),
                )
              }
            />
          )}
        </div>

        <div className="mt-9 flex justify-end gap-2">
          <Button
            className="h-[36px] rounded-[8px] px-4 text-sm"
            onClick={() => navigate(PATH.BRAND_PROMOTION)}
            size="sm"
            type="button"
            variant="outline"
          >
            취소
          </Button>
          <Button
            className="h-[36px] rounded-[8px] px-4 text-sm"
            disabled={!onSubmit || !values.brandId}
            isLoading={isLoading}
            onClick={handleSubmit}
            size="sm"
            type="button"
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
