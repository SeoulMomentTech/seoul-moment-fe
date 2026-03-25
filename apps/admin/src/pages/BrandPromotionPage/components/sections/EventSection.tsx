import { useState } from "react";

import { Plus, Trash2 } from "lucide-react";

import { LANGUAGE_LIST } from "@shared/constants/locale";

import {
  Button,
  cn,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@seoul-moment/ui";

import { FORM_INPUT_CLASS, FORM_TEXTAREA_CLASS } from "../../constants/form";
import type {
  BrandPromotionFormErrors,
  CouponFormValue,
  EventFormValue,
  EventStatus,
} from "../../types";
import { getLanguageCode, getLanguageLabel } from "../../utils/form";
import {
  Card,
  FieldError,
  FieldLabel,
  SectionHeader,
  SingleImageField,
} from "../FormShare";

interface EventSectionProps {
  createCoupon(): CouponFormValue;
  errors?: BrandPromotionFormErrors["events"];
  events: EventFormValue[];
  onAdd(): void;
  onChange(index: number, nextValue: EventFormValue): void;
  onRemove(index: number): void;
}

interface CouponCardProps {
  activeLanguage: "ko" | "en" | "zh";
  coupon: CouponFormValue;
  couponIndex: number;
  error?: BrandPromotionFormErrors["events"][number]["coupons"][number];
  event: EventFormValue;
  eventIndex: number;
  onChange(index: number, nextValue: EventFormValue): void;
}

function CouponLanguageTabs({
  activeLanguage,
  onLanguageChange,
}: {
  activeLanguage: "ko" | "en" | "zh";
  onLanguageChange(language: "ko" | "en" | "zh"): void;
}) {
  return (
    <div className="mb-4 grid grid-cols-3 rounded-[14px] bg-[#ececf1] p-1">
      {LANGUAGE_LIST.map((language) => {
        const code = getLanguageCode(language.code);
        const isActive = code === activeLanguage;

        return (
          <button
            className={cn("rounded-[12px] px-3 py-[8px] text-sm font-medium transition", isActive ? "bg-white text-black shadow-sm" : "text-black/80")}
            key={language.id}
            onClick={() => onLanguageChange(code)}
            type="button"
          >
            {getLanguageLabel(language.id)}
          </button>
        );
      })}
    </div>
  );
}

function CouponCard({
  activeLanguage,
  coupon,
  couponIndex,
  error,
  event,
  eventIndex,
  onChange,
}: CouponCardProps) {
  return (
    <Card className="bg-[#fcfcfd]">
      <div className="mb-4 flex items-center justify-between">
        <div className="font-medium">쿠폰 #{couponIndex + 1}</div>
        <button
          className="text-red-500"
          onClick={() =>
            onChange(eventIndex, {
              ...event,
              coupons: event.coupons.filter(
                (_, itemCouponIndex) => itemCouponIndex !== couponIndex,
              ),
            })
          }
          type="button"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <SingleImageField
        folder="brand"
        id={`coupon-image-${eventIndex}-${couponIndex}`}
        label="쿠폰 이미지"
        onChange={(url) =>
          onChange(eventIndex, {
            ...event,
            coupons: event.coupons.map((couponItem, itemCouponIndex) =>
              itemCouponIndex === couponIndex
                ? { ...couponItem, imagePath: url }
                : couponItem,
            ),
          })
        }
        preview={coupon.imagePath}
      />
      <FieldError message={error?.imagePath} />

      <div className="mt-4 space-y-3">
        <div>
          <FieldLabel>제목</FieldLabel>
          <Input
            className={FORM_INPUT_CLASS}
            onChange={(eventInput) =>
              onChange(eventIndex, {
                ...event,
                coupons: event.coupons.map((couponItem, itemCouponIndex) =>
                  itemCouponIndex === couponIndex
                    ? {
                      ...couponItem,
                      content: {
                        ...couponItem.content,
                        [activeLanguage]: {
                          ...couponItem.content[activeLanguage],
                          title: eventInput.target.value,
                        },
                      },
                    }
                    : couponItem,
                ),
              })
            }
            value={coupon.content[activeLanguage].title}
          />
          <FieldError message={error?.content?.[activeLanguage]?.title} />
        </div>

        <div>
          <FieldLabel>설명</FieldLabel>
          <Textarea
            className={FORM_TEXTAREA_CLASS}
            onChange={(eventInput) =>
              onChange(eventIndex, {
                ...event,
                coupons: event.coupons.map((couponItem, itemCouponIndex) =>
                  itemCouponIndex === couponIndex
                    ? {
                      ...couponItem,
                      content: {
                        ...couponItem.content,
                        [activeLanguage]: {
                          ...couponItem.content[activeLanguage],
                          description: eventInput.target.value,
                        },
                      },
                    }
                    : couponItem,
                ),
              })
            }
            value={coupon.content[activeLanguage].description}
          />
          <FieldError message={error?.content?.[activeLanguage]?.description} />
        </div>
      </div>
    </Card>
  );
}

export function EventSection({
  createCoupon,
  errors,
  events,
  onAdd,
  onChange,
  onRemove,
}: EventSectionProps) {
  const [eventCouponLanguageTabs, setEventCouponLanguageTabs] = useState<
    Record<number, "ko" | "en" | "zh">
  >({});

  return (
    <>
      <SectionHeader
        action={
          <Button
            className="gap-1"
            onClick={onAdd}
            size="sm"
            type="button"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            이벤트 추가
          </Button>
        }
        title="이벤트&쿠폰 목록"
      />
      <div className="space-y-4">
        {events.map((event, index) => {
          const activeCouponLanguage = eventCouponLanguageTabs[index] ?? "en";

          return (
            <Card key={`event-${index + 1}`}>
              <div className="mb-4 flex items-center justify-between">
                <div className="font-semibold">이벤트 #{index + 1}</div>
                <button
                  className="text-red-500"
                  onClick={() => onRemove(index)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4">
                <div className="mb-3 text-sm font-medium">이벤트 정보</div>
                <FieldLabel>상태</FieldLabel>
                <Select
                  onValueChange={(value) =>
                    onChange(index, { ...event, status: value as EventStatus })
                  }
                  value={event.status}
                >
                  <SelectTrigger className="h-[48px] rounded-[10px] border-black/15 bg-white text-left">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="NORMAL">일반</SelectItem>
                    <SelectItem value="DELETE">만료</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {LANGUAGE_LIST.map((language) => {
                  const code = getLanguageCode(language.code);
                  return (
                    <div key={`${index + 1}-event-title-${language.id}`}>
                      <FieldLabel>
                        {getLanguageLabel(language.id)} 제목
                      </FieldLabel>
                      <Input
                        className={FORM_INPUT_CLASS}
                        onChange={(eventInput) =>
                          onChange(index, {
                            ...event,
                            titles: {
                              ...event.titles,
                              [code]: eventInput.target.value,
                            },
                          })
                        }
                        value={event.titles[code]}
                      />
                      <FieldError message={errors?.[index]?.titles?.[code]} />
                    </div>
                  );
                })}
              </div>

              <div className="mt-6">
                <SectionHeader
                  action={
                    <Button
                      className="gap-1"
                      onClick={() =>
                        onChange(index, {
                          ...event,
                          coupons: [...event.coupons, createCoupon()],
                        })
                      }
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                      쿠폰 추가
                    </Button>
                  }
                  title="쿠폰 목록"
                />

                {event.coupons.length === 0 ? (
                  <div className="py-8 text-center text-sm text-black/35">
                    쿠폰이 없습니다.
                  </div>
                ) : (
                  <div>
                    <CouponLanguageTabs
                      activeLanguage={activeCouponLanguage}
                      onLanguageChange={(language) =>
                        setEventCouponLanguageTabs((current) => ({
                          ...current,
                          [index]: language,
                        }))
                      }
                    />

                    <div className="space-y-3">
                      {event.coupons.map((coupon, couponIndex) => (
                        <CouponCard
                          activeLanguage={activeCouponLanguage}
                          coupon={coupon}
                          couponIndex={couponIndex}
                          error={errors?.[index]?.coupons?.[couponIndex]}
                          event={event}
                          eventIndex={index}
                          key={`coupon-${index + 1}-${couponIndex + 1}`}
                          onChange={onChange}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
