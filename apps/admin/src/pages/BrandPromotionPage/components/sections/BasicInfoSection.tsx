import { LANGUAGE_LIST } from "@shared/constants/locale";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@seoul-moment/ui";

import type {
  BrandPromotionFormErrors,
  BrandPromotionFormValues,
} from "../../types";
import { getLanguageCode } from "../../utils/form";
import { Card, FieldError, FieldLabel } from "../FormShare";

interface BasicInfoSectionProps {
  brandOptions: Array<{ value: string; label: string }>;
  promotionOptions: Array<{ value: string; label: string }>;
  errors?: BrandPromotionFormErrors["values"];
  isBrandLoading: boolean;
  isPromotionLoading: boolean;
  onChange(values: BrandPromotionFormValues): void;
  values: BrandPromotionFormValues;
}

export function BasicInfoSection({
  brandOptions,
  promotionOptions,
  errors,
  isBrandLoading,
  isPromotionLoading,
  onChange,
  values,
}: BasicInfoSectionProps) {
  return (
    <>
      <div className="mb-6">
        <FieldLabel>
          프로모션 <span className="text-black">*</span>
        </FieldLabel>
        <Select
          onValueChange={(value) =>
            onChange({
              ...values,
              promotionId: Number(value),
            })
          }
          value={values.promotionId ? String(values.promotionId) : undefined}
        >
          <SelectTrigger className="h-[48px] rounded-[10px] border-black/15 bg-white text-left" disabled={isPromotionLoading || promotionOptions.length === 0}>
            <SelectValue
              placeholder={
                isPromotionLoading ? "프로모션 불러오는 중..." : "프로모션 선택"
              }
            />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {promotionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={errors?.promotionId} />
      </div>

      <div className="mb-6">
        <FieldLabel>
          브랜드 <span className="text-black">*</span>
        </FieldLabel>
        <Select
          onValueChange={(value) =>
            onChange({
              ...values,
              brandId: Number(value),
            })
          }
          value={values.brandId ? String(values.brandId) : undefined}
        >
          <SelectTrigger className="h-[48px] rounded-[10px] border-black/15 bg-white text-left">
            <SelectValue
              placeholder={
                isBrandLoading ? "브랜드 불러오는 중..." : "브랜드 선택"
              }
            />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {brandOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={errors?.brandId} />
      </div>

      <div className="mb-6 flex items-center gap-3">
        <span className="text-sm font-medium">활성화</span>
        <button
          aria-pressed={values.isActive}
          className={`relative h-6 w-11 rounded-full transition ${values.isActive ? "bg-black" : "bg-black/15"}`}
          onClick={() =>
            onChange({
              ...values,
              isActive: !values.isActive,
            })
          }
          type="button"
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${values.isActive ? "left-[22px]" : "left-0.5"}`}
          />
        </button>
      </div>

      <div className="space-y-3">
        {LANGUAGE_LIST.map((language) => {
          const code = getLanguageCode(language.code);
          return (
            <Card key={language.id}>
              <div className="mb-3 text-sm font-medium">
                {language.id === 2 ? "영어" : language.name}
              </div>
              <FieldLabel>
                설명 <span className="text-black">*</span>
              </FieldLabel>
              <Textarea
                className="min-h-[120px] resize-none border-black/20 bg-white"
                onChange={(event) =>
                  onChange({
                    ...values,
                    descriptions: {
                      ...values.descriptions,
                      [code]: event.target.value,
                    },
                  })
                }
                value={values.descriptions[code]}
              />
              <FieldError message={errors?.descriptions?.[code]} />
            </Card>
          );
        })}
      </div>
    </>
  );
}
