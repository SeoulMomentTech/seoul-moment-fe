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
  toPhoneInput,
  toTaiwanMobileE164,
  type OrderShippingValues,
} from "../model/schema";

const FIELD_LABEL_CLASS = "text-body-3 text-black";
const INPUT_CLASS = "h-12 py-0";

/** 읽기 전용 모드와 편집 폼이 같은 자리를 쓰도록 두 격자를 공유한다 */
const TWO_COLUMN_CLASS = cn("grid grid-cols-2 gap-3", "max-sm:grid-cols-1");
const ADDRESS_COLUMN_CLASS = cn(
  "grid grid-cols-[96px_1fr_1fr] gap-2",
  "max-sm:grid-cols-1",
);

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

/**
 * 필수 필드 라벨. `htmlFor` 가 없으면 읽기 전용 값이라 가리킬 폼 요소가 없다 — `label` 대신
 * `span` 으로 낸다.
 */
function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: string;
}) {
  const content = (
    <>
      {children}
      <span className="text-danger ml-0.5">*</span>
    </>
  );

  if (!htmlFor) {
    return <span className={FIELD_LABEL_CLASS}>{content}</span>;
  }

  return (
    <Label className={FIELD_LABEL_CLASS} htmlFor={htmlFor}>
      {content}
    </Label>
  );
}

/** 편집 폼의 `Input` 과 같은 크기의 읽기 전용 칸. 채움색으로 못 고치는 값임을 알린다. */
function ReadOnlyValue({
  className,
  children,
}: {
  className?: string;
  children?: string;
}) {
  return (
    <p
      className={cn(
        "text-body-3 flex h-12 items-center rounded-[4px] border border-black/20 bg-black/5 px-3",
        className,
      )}
    >
      {children}
    </p>
  );
}

function ReadOnlyField({
  label,
  valueClassName,
  children,
}: {
  label: string;
  valueClassName?: string;
  children?: string;
}) {
  return (
    <div className="grid gap-2">
      <FieldLabel>{label}</FieldLabel>
      <ReadOnlyValue className={valueClassName}>{children}</ReadOnlyValue>
    </div>
  );
}

/**
 * 에러 자리는 문구가 없어도 비워 둔다 — 검증이 `onBlur` 라, 포커스를 뗄 때마다 아래 필드가
 * 밀렸다 돌아오면 입력하던 자리를 놓친다. `aria-describedby` 가 가리킬 대상도 늘 있어야 한다.
 */
function FieldError({ id, children }: { id: string; children?: string }) {
  return (
    <p
      className="text-body-5 text-danger min-h-4 leading-4"
      id={id}
      role="alert"
    >
      {children}
    </p>
  );
}
