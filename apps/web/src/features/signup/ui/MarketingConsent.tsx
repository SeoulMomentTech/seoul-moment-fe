"use client";

import { Check } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn, HStack, VStack } from "@seoul-moment/ui";

export type MarketingConsentKey =
  | "newProductAgreed"
  | "adAgreed"
  | "recommendAgreed";

const CONSENT_ITEMS: { key: MarketingConsentKey; labelKey: string }[] = [
  { key: "newProductAgreed", labelKey: "new_arrivals_alerts" },
  { key: "adAgreed", labelKey: "marketing_promotion_emails" },
  { key: "recommendAgreed", labelKey: "personalized_product_suggestions" },
];

interface MarketingConsentProps {
  newProductAgreed: boolean;
  adAgreed: boolean;
  recommendAgreed: boolean;
  onChange(key: MarketingConsentKey, next: boolean): void;
}

export function MarketingConsent({
  newProductAgreed,
  adAgreed,
  recommendAgreed,
  onChange,
}: MarketingConsentProps) {
  const t = useTranslations();
  const values: Record<MarketingConsentKey, boolean> = {
    newProductAgreed,
    adAgreed,
    recommendAgreed,
  };
  const isAllAgreed = CONSENT_ITEMS.every(({ key }) => values[key]);

  const handleToggleAll = () => {
    const next = !isAllAgreed;
    CONSENT_ITEMS.forEach(({ key }) => onChange(key, next));
  };

  return (
    <VStack className="w-full pt-[20px]" gap={8}>
      <p className="text-body-3 w-full leading-none text-black/60">
        {t("marketing_opts")}
      </p>

      <VStack className="w-full" gap={0}>
        <HStack className="w-full border-b border-black/5 pb-[16px] pt-[10px]">
          <CheckboxButton
            active={isAllAgreed}
            label={t("agree_all")}
            onToggle={handleToggleAll}
          />
        </HStack>

        <VStack className="w-full pt-[16px]" gap={20}>
          {CONSENT_ITEMS.map(({ key, labelKey }) => (
            <HStack align="between" className="w-full" key={key}>
              <CheckboxButton
                active={values[key]}
                label={t(labelKey)}
                onToggle={() => onChange(key, !values[key])}
              />
            </HStack>
          ))}
        </VStack>
      </VStack>
    </VStack>
  );
}

interface CheckboxButtonProps {
  active: boolean;
  label: string;
  onToggle(): void;
}

function CheckboxButton({ active, label, onToggle }: CheckboxButtonProps) {
  return (
    <button
      aria-pressed={active}
      className="flex cursor-pointer items-center gap-1"
      onClick={onToggle}
      type="button"
    >
      <span
        aria-hidden
        className={cn(
          "flex size-[14px] shrink-0 items-center justify-center rounded-full",
          active ? "bg-foreground" : "border border-black/20 bg-white",
        )}
      >
        {active ? (
          <Check className="text-white" size={9} strokeWidth={3} />
        ) : null}
      </span>
      <span className="text-body-3 text-foreground leading-none">{label}</span>
    </button>
  );
}
