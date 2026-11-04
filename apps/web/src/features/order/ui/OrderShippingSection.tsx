"use client";

import { useMemo } from "react";

import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";

import { useLanguage } from "@shared/lib/hooks";
import { getCityOptions, getDistrictOptions } from "@shared/lib/regions";
import { cn } from "@shared/lib/style";
import type { UserOrderShippingType } from "@shared/services/userOrder";
import { Checkbox } from "@shared/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/ui/select";

import { Input, Label } from "@seoul-moment/ui";

import { OrderCvsPickupPanel } from "./OrderCvsPickupPanel";
import {
  ADDRESS_COLUMN_CLASS,
  FIELD_LABEL_CLASS,
  FieldError,
  FieldLabel,
  INPUT_CLASS,
  ReadOnlyField,
  ReadOnlyValue,
  TWO_COLUMN_CLASS,
} from "./orderFields";
import { OrderShippingMethodTabs } from "./OrderShippingMethodTabs";
import {
  SHIPPING_ERROR_KEY,
  SHIPPING_REQUEST_KEYS,
  toPhoneInput,
  toTaiwanMobileE164,
  type OrderShippingValues,
} from "../model/schema";
import type { useOrderShipping } from "../model/useOrderShipping";

interface OrderShippingSectionProps {
  form: UseFormReturn<OrderShippingValues>;
  canUseDefault: boolean;
  useDefaultShipping: boolean;
  onUseDefaultChange(useDefault: boolean): void;
  onCityChange(city: string): void;
  onDistrictChange(district: string): void;
  shippingMethod: UserOrderShippingType;
  onShippingMethodChange(next: UserOrderShippingType): void;
  /** `useOrderShipping` 의 편의점 묶음을 그대로 받는다 */
  cvs: ReturnType<typeof useOrderShipping>["cvs"];
}

/**
 * 배송지 입력. 기본 배송지를 쓰는 동안에는 값을 보여주기만 하고, 체크를 풀면 폼이 열린다.
 *
 * 읽기 전용 요약도 같은 폼 값을 그린다 — 표시용 사본을 따로 만들면 미리보기가 쓰는 주소와
 * 화면에 보이는 주소가 달라질 수 있다. 라벨과 격자도 편집 폼과 맞춰 둔다. 체크를 켜고 끌 때
 * 값이 자리를 옮기면 같은 주소를 다시 읽어야 한다.
 */
export function OrderShippingSection({
  form,
  canUseDefault,
  useDefaultShipping,
  onUseDefaultChange,
  onCityChange,
  onDistrictChange,
  shippingMethod,
  onShippingMethodChange,
  cvs,
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

  const phoneField = register("phone");

  const tabs = (
    <OrderShippingMethodTabs
      onChange={onShippingMethodChange}
      value={shippingMethod}
    />
  );

  // 편의점 픽업은 기본 배송지 체크도 배송 요청사항도 없다 — 서버 cvsPickup 에 그 자리가 없다.
  if (shippingMethod === "CVS") {
    return (
      <>
        {tabs}
        <OrderCvsPickupPanel
          chain={cvs.chain}
          form={cvs.form}
          isStoreExpired={cvs.isStoreExpired}
          isStoreLoading={cvs.isStoreLoading}
          onOpenMap={cvs.openCvsMap}
          store={cvs.store}
        />
      </>
    );
  }

  return (
    <>
      {tabs}

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
        <div className="grid gap-4">
          <div className={TWO_COLUMN_CLASS}>
            <ReadOnlyField label={t("recipient_name")}>
              {values.recipientName}
            </ReadOnlyField>
            <ReadOnlyField
              label={t("recipient_phone")}
              valueClassName="tabular-nums"
            >
              {toTaiwanMobileE164(values.phone) || values.phone}
            </ReadOnlyField>
          </div>

          <div className="grid gap-2">
            <FieldLabel>{t("order_address")}</FieldLabel>
            <div className={ADDRESS_COLUMN_CLASS}>
              <ReadOnlyValue className="tabular-nums">
                {values.postalCode}
              </ReadOnlyValue>
              <ReadOnlyValue>{values.city}</ReadOnlyValue>
              <ReadOnlyValue>{values.district}</ReadOnlyValue>
            </div>
            <ReadOnlyValue>{values.detailAddress}</ReadOnlyValue>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className={TWO_COLUMN_CLASS}>
            <div className="grid gap-2">
              <FieldLabel htmlFor="order-recipient">
                {t("recipient_name")}
              </FieldLabel>
              <Input
                aria-describedby="order-recipient-error"
                aria-invalid={!!errors.recipientName}
                autoComplete="name"
                className={cn(
                  INPUT_CLASS,
                  errors.recipientName && "border-danger",
                )}
                id="order-recipient"
                placeholder={t("recipient_name")}
                {...register("recipientName")}
              />
              <FieldError id="order-recipient-error">
                {errorFor("recipientName")}
              </FieldError>
            </div>

            <div className="grid gap-2">
              <FieldLabel htmlFor="order-phone">
                {t("recipient_phone")}
              </FieldLabel>
              {/* 국가번호는 칸에 박아 둔다 — 사용자가 넣고 빼는 자리가 아니다 */}
              <div className="relative">
                <span
                  className="text-body-3 pointer-events-none absolute inset-y-0 left-3 flex items-center text-black/60"
                  id="order-phone-prefix"
                >
                  +886
                </span>
                <Input
                  aria-describedby="order-phone-prefix order-phone-error"
                  aria-invalid={!!errors.phone}
                  autoComplete="tel"
                  className={cn(
                    INPUT_CLASS,
                    "pl-14 tabular-nums",
                    errors.phone && "border-danger",
                  )}
                  id="order-phone"
                  inputMode="numeric"
                  placeholder="912345678"
                  {...phoneField}
                  onChange={(event) => {
                    // 이벤트를 넘기기 전에 칸을 고친다 — 숫자 아닌 입력은 화면에도 남지 않는다.
                    event.target.value = toPhoneInput(event.target.value);

                    return phoneField.onChange(event);
                  }}
                />
              </div>
              <FieldError id="order-phone-error">
                {errorFor("phone")}
              </FieldError>
            </div>
          </div>

          <div className="grid gap-2">
            <FieldLabel htmlFor="order-postal">{t("order_address")}</FieldLabel>
            <div className={ADDRESS_COLUMN_CLASS}>
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
              className={cn(
                INPUT_CLASS,
                errors.detailAddress && "border-danger",
              )}
              placeholder={t("detail_address")}
              {...register("detailAddress")}
            />
            <FieldError id="order-address-error">
              {errorFor("detailAddress") ?? errorFor("city")}
            </FieldError>
          </div>
        </div>
      )}

      {/* 저장된 주소의 일부가 아니라 주문마다 고르는 값이다 — 기본 배송지를 써도 보인다 */}
      <div className="mt-4 grid gap-2">
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
    </>
  );
}
