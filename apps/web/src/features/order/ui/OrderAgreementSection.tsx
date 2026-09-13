"use client";

import { useTranslations } from "next-intl";

import { Checkbox } from "@shared/ui/checkbox";

interface OrderAgreementSectionProps {
  agreed: boolean;
  onAgreedChange(agreed: boolean): void;
}

/** 동의 대상 약관. 지금은 한 번에 묶어 받는다 — 법무 검토가 붙으면 개별 체크로 쪼갠다 */
const TERMS_KEYS = ["terms_payment_agency", "terms_third_party_shipping"];

export function OrderAgreementSection({
  agreed,
  onAgreedChange,
}: OrderAgreementSectionProps) {
  const t = useTranslations();

  return (
    <div className="grid gap-3 rounded-[4px] border border-black/20 p-4">
      <label className="text-body-3 flex cursor-pointer items-start gap-2 leading-relaxed">
        <Checkbox
          checked={agreed}
          className="mt-0.5"
          onChange={(event) => onAgreedChange(event.target.checked)}
        />
        <span>
          {t("order_agreement_confirm")}
          <span className="text-danger ml-0.5">*</span>
        </span>
      </label>

      <div className="grid gap-2 pl-7">
        {TERMS_KEYS.map((key) => (
          <span
            className="text-body-5 text-neutral flex justify-between gap-4"
            key={key}
          >
            <span>{t(key)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
