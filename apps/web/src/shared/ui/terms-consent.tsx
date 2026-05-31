"use client";

import { useState } from "react";

import { Check, ChevronRight } from "lucide-react";

import { PrivacyPolicyContent } from "@shared/ui/privacy-policy-content";
import { TermsModal } from "@shared/ui/terms-modal";
import { TermsOfServiceContent } from "@shared/ui/terms-of-service-content";

import { cn, HStack, VStack } from "@seoul-moment/ui";

type TermKey = "termsOfService" | "privacyPolicy";

const TERM_ITEMS: { key: TermKey; label: string }[] = [
  { key: "termsOfService", label: "Terms of Service" },
  { key: "privacyPolicy", label: "Privacy Policy" },
];

interface TermsConsentProps {
  termsOfService: boolean;
  privacyPolicy: boolean;
  onChange(key: TermKey, next: boolean): void;
}

export function TermsConsent({
  termsOfService,
  privacyPolicy,
  onChange,
}: TermsConsentProps) {
  const [openKey, setOpenKey] = useState<TermKey | null>(null);

  const values: Record<TermKey, boolean> = { termsOfService, privacyPolicy };
  const isAllAgreed = TERM_ITEMS.every(({ key }) => values[key]);

  const handleToggleAll = () => {
    const next = !isAllAgreed;
    TERM_ITEMS.forEach(({ key }) => onChange(key, next));
  };

  return (
    <>
      <VStack className="w-full pt-[20px]" gap={8}>
        <p className="text-body-3 w-full leading-none text-black/60">
          서비스 약관 및 정책
        </p>

        <VStack className="w-full" gap={0}>
          <HStack className="w-full border-b border-black/5 pb-[16px] pt-[10px]">
            <CheckboxButton
              active={isAllAgreed}
              label="전체 동의"
              onToggle={handleToggleAll}
            />
          </HStack>

          <VStack className="w-full pt-[16px]" gap={20}>
            {TERM_ITEMS.map(({ key, label }) => (
              <HStack align="between" className="w-full" key={key}>
                <CheckboxButton
                  active={values[key]}
                  label={label}
                  onToggle={() => onChange(key, !values[key])}
                />
                <button
                  className="flex cursor-pointer items-center text-black/40"
                  onClick={() => setOpenKey(key)}
                  type="button"
                >
                  <span className="text-body-3 leading-none">자세히</span>
                  <ChevronRight className="size-[14px]" />
                </button>
              </HStack>
            ))}
          </VStack>
        </VStack>
      </VStack>

      {TERM_ITEMS.map(({ key, label }) => (
        <TermsModal
          key={key}
          onOpenChange={(open) => {
            if (!open) setOpenKey(null);
          }}
          open={openKey === key}
          title={label}
        >
          {key === "termsOfService" ? (
            <TermsOfServiceContent />
          ) : (
            <PrivacyPolicyContent />
          )}
        </TermsModal>
      ))}
    </>
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
