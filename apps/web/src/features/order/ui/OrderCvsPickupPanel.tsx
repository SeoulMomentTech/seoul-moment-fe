"use client";

import { useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";

import { cn } from "@shared/lib/style";
import type {
  CvsChain,
  GetLogisticsCvsStoreRes,
} from "@shared/services/logistics";
import Chip from "@shared/ui/chip";

import { Input } from "@seoul-moment/ui";

import { OrderCvsStoreCard } from "./OrderCvsStoreCard";
import {
  FIELD_LABEL_CLASS,
  FieldError,
  FieldLabel,
  INPUT_CLASS,
  TWO_COLUMN_CLASS,
} from "./orderFields";
import { CVS_CHAINS } from "../model/cvsChain";
import {
  CVS_ERROR_KEY,
  toPhoneDigits,
  type OrderCvsPickupValues,
} from "../model/schema";

interface OrderCvsPickupPanelProps {
  form: UseFormReturn<OrderCvsPickupValues>;
  chain: CvsChain | null;
  store: GetLogisticsCvsStoreRes | undefined;
  isStoreLoading: boolean;
  isStoreExpired: boolean;
  isStoreError: boolean;
  /** 체인 칩. 이미 고른 매장의 체인이면 무시된다 */
  onOpenMap(chain: CvsChain): void;
  /** 카드의 "매장 다시 고르기". 같은 체인이라도 지도로 간다 */
  onReselect(): void;
  onRetry(): void;
}

/**
 * 편의점 픽업 입력. 체인 칩이 곧 지도 진입점이라 별도 "매장 고르기" 버튼이 없다.
 * 받는 분·휴대폰은 택배와 라벨은 같지만 규칙이 다르다 — 실명 대조, `09` 10자리.
 */
export function OrderCvsPickupPanel({
  form,
  chain,
  store,
  isStoreLoading,
  isStoreExpired,
  isStoreError,
  onOpenMap,
  onReselect,
  onRetry,
}: OrderCvsPickupPanelProps) {
  const t = useTranslations();

  const {
    register,
    formState: { errors },
  } = form;

  const errorFor = (field: keyof OrderCvsPickupValues) =>
    errors[field] ? t(CVS_ERROR_KEY[field]) : undefined;

  const phoneField = register("phone");

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <span className={FIELD_LABEL_CLASS}>{t("cvs_chain")}</span>
        <div className="flex flex-wrap gap-2">
          {CVS_CHAINS.map((item) => (
            <Chip
              active={chain === item.chain}
              aria-pressed={chain === item.chain}
              key={item.chain}
              onClick={() => onOpenMap(item.chain)}
              type="button"
            >
              {item.label}
            </Chip>
          ))}
        </div>
      </div>

      <OrderCvsStoreCard
        isError={isStoreError}
        isExpired={isStoreExpired}
        isLoading={isStoreLoading}
        onReselect={onReselect}
        onRetry={onRetry}
        store={store}
      />

      <div className={TWO_COLUMN_CLASS}>
        <div className="grid gap-2">
          <FieldLabel htmlFor="order-cvs-recipient">
            {t("recipient_name")}
          </FieldLabel>
          <Input
            aria-describedby="order-cvs-recipient-error"
            aria-invalid={!!errors.recipientName}
            autoComplete="name"
            className={cn(INPUT_CLASS, errors.recipientName && "border-danger")}
            id="order-cvs-recipient"
            placeholder={t("cvs_recipient_placeholder")}
            {...register("recipientName")}
          />
          <FieldError id="order-cvs-recipient-error">
            {errorFor("recipientName")}
          </FieldError>
        </div>

        <div className="grid gap-2">
          <FieldLabel htmlFor="order-cvs-phone">
            {t("recipient_phone")}
          </FieldLabel>
          <Input
            aria-describedby="order-cvs-phone-error"
            aria-invalid={!!errors.phone}
            autoComplete="tel"
            className={cn(
              INPUT_CLASS,
              "tabular-nums",
              errors.phone && "border-danger",
            )}
            id="order-cvs-phone"
            inputMode="numeric"
            placeholder="0912345678"
            {...phoneField}
            onChange={(event) => {
              // 숫자 아닌 입력은 화면에도 남기지 않는다
              event.target.value = toPhoneDigits(event.target.value);

              return phoneField.onChange(event);
            }}
          />
          <FieldError id="order-cvs-phone-error">
            {errorFor("phone")}
          </FieldError>
        </div>
      </div>
    </div>
  );
}
