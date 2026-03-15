import { Plus, Trash2 } from "lucide-react";

import { LANGUAGE_LIST } from "@shared/constants/locale";

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@seoul-moment/ui";

import { FORM_INPUT_CLASS, FORM_TEXTAREA_CLASS } from "../../constants/form";
import type { CouponFormValue, EventFormValue, EventStatus } from "../../types";
import { getLanguageCode, getLanguageLabel } from "../../utils/form";
import {

  Card,
  FieldLabel,
  SectionHeader,
  SingleImageField,
} from "../FormShare";

interface EventSectionProps {
  events: EventFormValue[];
  onAdd(): void;
  onChange(index: number, nextValue: EventFormValue): void;
  onRemove(index: number): void;
  createCoupon(): CouponFormValue;
}

export function EventSection({
  createCoupon,
  events,
  onAdd,
  onChange,
  onRemove,
}: EventSectionProps) {
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
        {events.map((event, index) => (
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
                <SelectContent>
                  <SelectItem value="NORMAL">일반</SelectItem>
                  <SelectItem value="DELETE">삭제</SelectItem>
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
                <div className="space-y-3">
                  {event.coupons.map((coupon, couponIndex) => (
                    <Card
                      className="bg-[#fcfcfd]"
                      key={`coupon-${index + 1}-${couponIndex + 1}`}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="font-medium">
                          쿠폰 #{couponIndex + 1}
                        </div>
                        <button
                          className="text-red-500"
                          onClick={() =>
                            onChange(index, {
                              ...event,
                              coupons: event.coupons.filter(
                                (_, itemCouponIndex) =>
                                  itemCouponIndex !== couponIndex,
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
                        id={`coupon-image-${index}-${couponIndex}`}
                        label="쿠폰 이미지"
                        onChange={(url) =>
                          onChange(index, {
                            ...event,
                            coupons: event.coupons.map(
                              (couponItem, itemCouponIndex) =>
                                itemCouponIndex === couponIndex
                                  ? { ...couponItem, imagePath: url }
                                  : couponItem,
                            ),
                          })
                        }
                        preview={coupon.imagePath}
                      />

                      <div className="mt-4 space-y-3">
                        {LANGUAGE_LIST.map((language) => {
                          const code = getLanguageCode(language.code);
                          return (
                            <div
                              key={`coupon-${couponIndex + 1}-${language.id}`}
                            >
                              <FieldLabel>
                                {getLanguageLabel(language.id)}
                              </FieldLabel>
                              <Input
                                className={`${FORM_INPUT_CLASS} mb-2`}
                                onChange={(eventInput) =>
                                  onChange(index, {
                                    ...event,
                                    coupons: event.coupons.map(
                                      (couponItem, itemCouponIndex) =>
                                        itemCouponIndex === couponIndex
                                          ? {
                                            ...couponItem,
                                            content: {
                                              ...couponItem.content,
                                              [code]: {
                                                ...couponItem.content[code],
                                                title:
                                                  eventInput.target.value,
                                              },
                                            },
                                          }
                                          : couponItem,
                                    ),
                                  })
                                }
                                placeholder="쿠폰 제목"
                                value={coupon.content[code].title}
                              />
                              <Textarea
                                className={FORM_TEXTAREA_CLASS}
                                onChange={(eventInput) =>
                                  onChange(index, {
                                    ...event,
                                    coupons: event.coupons.map(
                                      (couponItem, itemCouponIndex) =>
                                        itemCouponIndex === couponIndex
                                          ? {
                                            ...couponItem,
                                            content: {
                                              ...couponItem.content,
                                              [code]: {
                                                ...couponItem.content[code],
                                                description:
                                                  eventInput.target.value,
                                              },
                                            },
                                          }
                                          : couponItem,
                                    ),
                                  })
                                }
                                placeholder="쿠폰 설명"
                                value={coupon.content[code].description}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
