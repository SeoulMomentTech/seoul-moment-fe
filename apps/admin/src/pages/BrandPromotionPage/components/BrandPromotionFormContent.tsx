import type { BrandPromotionFormState } from "../hooks/useBrandPromotionForm";
import type { BrandPromotionFormValues } from "../types";
import {
  createEmptyBanner,
  createEmptyCoupon,
  createEmptyEvent,
  createEmptyNotice,
  createEmptyPopup,
  createEmptySection,
} from "../utils/form";
import { BannerSection } from "./sections/BannerSection";
import { BasicInfoSection } from "./sections/BasicInfoSection";
import { EventSection } from "./sections/EventSection";
import { NoticeSection } from "./sections/NoticeSection";
import { PopupSection } from "./sections/PopupSection";
import { SectionListSection } from "./sections/SectionListSection";

interface BrandPromotionFormContentProps {
  brandOptions: Array<{ value: string; label: string }>;
  promotionOptions: Array<{ value: string; label: string }>;
  form: BrandPromotionFormState;
  isBrandLoading: boolean;
  isPromotionLoading: boolean;
}

function assertUnreachable(x: never): never {
  throw new Error(`Unexpected object: ${x}`);
}

export function BrandPromotionFormContent({
  brandOptions,
  promotionOptions,
  form,
  isBrandLoading,
  isPromotionLoading,
}: BrandPromotionFormContentProps) {
  switch (form.activeTab) {
    case "basic":
      return (
        <BasicInfoSection
          brandOptions={brandOptions}
          errors={form.isSubmitAttempted ? form.errors.values : undefined}
          isBrandLoading={isBrandLoading}
          isPromotionLoading={isPromotionLoading}
          onChange={
            form.setValues as (values: BrandPromotionFormValues) => void
          }
          promotionOptions={promotionOptions}
          values={form.values}
        />
      );
    case "banner":
      return (
        <BannerSection
          banners={form.banners}
          errors={form.isSubmitAttempted ? form.errors.banners : undefined}
          onAdd={() =>
            form.setBanners((current) => [...current, createEmptyBanner()])
          }
          onChange={(index, nextValue) =>
            form.setBanners((current) =>
              current.map((item, itemIndex) =>
                itemIndex === index ? nextValue : item,
              ),
            )
          }
          onRemove={(index) =>
            form.setBanners((current) =>
              current.length === 1
                ? current
                : current.filter((_, itemIndex) => itemIndex !== index),
            )
          }
        />
      );
    case "section":
      return (
        <SectionListSection
          errors={form.isSubmitAttempted ? form.errors.sections : undefined}
          onAdd={() =>
            form.setSections((current) => [...current, createEmptySection()])
          }
          onChange={(index, nextValue) =>
            form.setSections((current) =>
              current.map((item, itemIndex) =>
                itemIndex === index ? nextValue : item,
              ),
            )
          }
          onRemove={(index) =>
            form.setSections((current) =>
              current.length === 1
                ? current
                : current.filter((_, itemIndex) => itemIndex !== index),
            )
          }
          sections={form.sections}
        />
      );
    case "popup":
      return (
        <PopupSection
          errors={form.isSubmitAttempted ? form.errors.popups : undefined}
          onAdd={() =>
            form.setPopups((current) => [...current, createEmptyPopup()])
          }
          onChange={(index, nextValue) =>
            form.setPopups((current) =>
              current.map((item, itemIndex) =>
                itemIndex === index ? nextValue : item,
              ),
            )
          }
          onRemove={(index) =>
            form.setPopups((current) =>
              current.length === 1
                ? current
                : current.filter((_, itemIndex) => itemIndex !== index),
            )
          }
          popups={form.popups}
        />
      );
    case "notice":
      return (
        <NoticeSection
          errors={form.isSubmitAttempted ? form.errors.notices : undefined}
          notices={form.notices}
          onAdd={() =>
            form.setNotices((current) => [...current, createEmptyNotice()])
          }
          onChange={(index, nextValue) =>
            form.setNotices((current) =>
              current.map((item, itemIndex) =>
                itemIndex === index ? nextValue : item,
              ),
            )
          }
          onRemove={(index) =>
            form.setNotices((current) =>
              current.length === 1
                ? current
                : current.filter((_, itemIndex) => itemIndex !== index),
            )
          }
        />
      );
    case "event":
      return (
        <EventSection
          createCoupon={createEmptyCoupon}
          errors={form.isSubmitAttempted ? form.errors.events : undefined}
          events={form.events}
          onAdd={() =>
            form.setEvents((current) => [...current, createEmptyEvent()])
          }
          onChange={(index, nextValue) =>
            form.setEvents((current) =>
              current.map((item, itemIndex) =>
                itemIndex === index ? nextValue : item,
              ),
            )
          }
          onRemove={(index) =>
            form.setEvents((current) =>
              current.length === 1
                ? current
                : current.filter((_, itemIndex) => itemIndex !== index),
            )
          }
        />
      );
    default:
      return assertUnreachable(form.activeTab);
  }
}
