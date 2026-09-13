"use client";

import { useMemo } from "react";

import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";

import { useLanguage } from "@shared/lib/hooks";
import { getCityOptions, getDistrictOptions } from "@shared/lib/regions";
import { cn } from "@shared/lib/style";
import { Checkbox } from "@shared/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";

import { Input, Label } from "@seoul-moment/ui";

import {
  SHIPPING_ERROR_KEY,
  SHIPPING_REQUEST_KEYS,
  type OrderShippingValues,
} from "../model/schema";

const FIELD_LABEL_CLASS = "text-body-3 text-black";
const INPUT_CLASS = "h-12 py-0";

interface OrderShippingSectionProps {
  form: UseFormReturn<OrderShippingValues>;
  canUseDefault: boolean;
  useDefaultShipping: boolean;
  onUseDefaultChange(useDefault: boolean): void;
  onCityChange(city: string): void;
  onDistrictChange(district: string): void;
}

/**
 * 배송지 입력. 기본 배송지를 쓰는 동안에는 값을 보여주기만 하고, 체크를 풀면 폼이 열린다.
 *
 * 읽기 전용 요약도 같은 폼 값을 그린다 — 표시용 사본을 따로 만들면 미리보기가 쓰는 주소와
 * 화면에 보이는 주소가 달라질 수 있다.
 */
export function OrderShippingSection({
  form,
  canUseDefault,
  useDefaultShipping,
  onUseDefaultChange,
  onCityChange,
  onDistrictChange,
}: OrderShippingSectionProps) {
  const t = useTranslations();
  const locale = useLanguage();

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const values = watch();

  const cityOptions = useMemo(() => getCityOptions(locale), [locale]);
  const districtOptions = useMemo(
    () => getDistrictOptions(values.city, locale),
    [values.city, locale],
  );

  const errorFor = (field: keyof OrderShippingValues) =>
    errors[field] ? t(SHIPPING_ERROR_KEY[field]) : undefined;

  return (
    <>
      {/* 프로필에 주소나 연락처가 없으면 기본 배송지라는 선택지 자체가 없다 */}
      {canUseDefault && (
        <label className="text-body-3 mb-4 flex cursor-pointer items-center gap-2">
          <Checkbox
            checked={useDefaultShipping}
            onChange={(event) => onUseDefaultChange(event.target.checked)}
          />
          {t("use_default_shipping")}
        </label>
      )}

      {useDefaultShipping ? (
        <div className="grid gap-2 rounded-[4px] bg-black/[0.03] p-4">
          <p className="text-body-3 font-semibold">{values.recipientName}</p>
          <p className="text-body-3 tabular-nums text-black/80">
            {values.phone}
          </p>
          <p className="text-body-3 leading-relaxed text-black/80">
            {values.postalCode} {values.city} {values.district}
            <br />
            {values.detailAddress}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className={cn("grid grid-cols-2 gap-3", "max-sm:grid-cols-1")}>
            <div className="grid gap-2">
              <Label className={FIELD_LABEL_CLASS} htmlFor="order-recipient">
                {t("recipient_name")}
                <span className="text-danger ml-0.5">*</span>
              </Label>
              <Input
                aria-describedby="order-recipient-error"
                aria-invalid={!!errors.recipientName}
                className={INPUT_CLASS}
                id="order-recipient"
                placeholder={t("recipient_name")}
                {...register("recipientName")}
              />
              <FieldError id="order-recipient-error">
                {errorFor("recipientName")}
              </FieldError>
            </div>

            <div className="grid gap-2">
              <Label className={FIELD_LABEL_CLASS} htmlFor="order-phone">
                {t("recipient_phone")}
                <span className="text-danger ml-0.5">*</span>
              </Label>
              <Input
                aria-describedby="order-phone-error"
                aria-invalid={!!errors.phone}
                className={INPUT_CLASS}
                id="order-phone"
                inputMode="tel"
                placeholder="+886"
                {...register("phone")}
              />
              <FieldError id="order-phone-error">
                {errorFor("phone")}
              </FieldError>
            </div>
          </div>

          <div className="grid gap-2">
            <Label className={FIELD_LABEL_CLASS} htmlFor="order-postal">
              {t("order_address")}
              <span className="text-danger ml-0.5">*</span>
            </Label>
            <div
              className={cn(
                "grid grid-cols-[96px_1fr_1fr] gap-2",
                "max-sm:grid-cols-1",
              )}
            >
              {/* 縣市·區 를 고르면 자동으로 채워진다. 직접 고칠 이유가 없어 읽기 전용이다. */}
              <Input
                className={cn(INPUT_CLASS, "tabular-nums")}
                id="order-postal"
                placeholder={t("postal_code")}
                readOnly
                {...register("postalCode")}
              />
              <Select onValueChange={onCityChange} value={values.city}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={t("city")} />
                </SelectTrigger>
                <SelectContent className="h-[250px]">
                  {cityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                disabled={!values.city}
                // 縣市 가 바뀌면 이전 區 선택이 남지 않도록 트리거를 새로 만든다(mypage 관행)
                key={values.city || "no-city"}
                onValueChange={onDistrictChange}
                value={values.district}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={t("district")} />
                </SelectTrigger>
                <SelectContent className="h-[250px]">
                  {districtOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              aria-describedby="order-address-error"
              aria-invalid={!!errors.detailAddress}
              className={INPUT_CLASS}
              placeholder={t("detail_address")}
              {...register("detailAddress")}
            />
            <FieldError id="order-address-error">
              {errorFor("detailAddress") ?? errorFor("city")}
            </FieldError>
          </div>

          <div className="grid gap-2">
            <Label className={FIELD_LABEL_CLASS}>{t("shipping_request")}</Label>
            <Select
              onValueChange={(next) =>
                setValue(
                  "requestMessage",
                  next as OrderShippingValues["requestMessage"],
                )
              }
              value={values.requestMessage}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHIPPING_REQUEST_KEYS.map((key) => (
                  <SelectItem key={key} value={key}>
                    {t(key)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </>
  );
}

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;

  return (
    <p className="text-body-5 text-danger" id={id} role="alert">
      {children}
    </p>
  );
}
