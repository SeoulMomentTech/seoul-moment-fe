"use client";

import { useId } from "react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import type { UserOrderPaymentMethod } from "@shared/services/userOrder";

import { Label, RadioGroup, RadioGroupItem } from "@seoul-moment/ui";

interface PaymentOption {
  value: UserOrderPaymentMethod;
  /** 결제사 표기. 실제 로고 대신 색 배지 + 이름이다 — 각 사 브랜드 가이드를 따라야 한다 */
  mark: string;
  markClassName: string;
  descriptionKey: string;
}

const PAYMENT_OPTIONS: ReadonlyArray<PaymentOption> = [
  {
    value: "LINE_PAY",
    mark: "LINE Pay",
    markClassName: "bg-[#06c755] text-white",
    descriptionKey: "payment_line_pay_description",
  },
  {
    value: "ECPAY",
    mark: "ECPay",
    markClassName: "bg-[#0b1f3a] text-white",
    descriptionKey: "payment_ecpay_description",
  },
];

interface OrderPaymentSectionProps {
  value: UserOrderPaymentMethod;
  onChange(value: UserOrderPaymentMethod): void;
}

/**
 * 결제 수단 선택.
 *
 * 카드·ATM·편의점처럼 세부 수단을 우리 화면에서 다시 나누지 않는다 — ECPay 결제창이
 * 자체로 제공하고, 두 번 고르게 하면 어느 쪽이 실제 선택인지 알 수 없다.
 */
export function OrderPaymentSection({
  value,
  onChange,
}: OrderPaymentSectionProps) {
  const t = useTranslations();
  const groupId = useId();

  return (
    <>
      <RadioGroup
        className="gap-2.5"
        onValueChange={(next) => onChange(next as UserOrderPaymentMethod)}
        value={value}
      >
        {PAYMENT_OPTIONS.map((option) => {
          const id = `${groupId}-${option.value}`;

          return (
            <Label
              className={cn(
                "flex cursor-pointer items-center gap-3 border p-4",
                value === option.value
                  ? "border-black"
                  : "border-black/20 hover:border-black/40",
              )}
              htmlFor={id}
              key={option.value}
            >
              <RadioGroupItem id={id} value={option.value} />
              <span
                className={cn(
                  "text-body-5 rounded-[2px] px-1.5 py-1 font-semibold",
                  option.markClassName,
                )}
              >
                {option.mark}
              </span>
              <span className="text-body-3">{t(option.descriptionKey)}</span>
            </Label>
          );
        })}
      </RadioGroup>

      <p className="text-body-5 text-neutral mt-3 leading-relaxed">
        {t("payment_external_note")}
      </p>
    </>
  );
}
