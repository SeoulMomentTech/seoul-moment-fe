"use client";

import { useState } from "react";

import { Check, CheckCircle2, CircleAlert } from "lucide-react";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { cn } from "@shared/lib/style";

import { Button, Label } from "@seoul-moment/ui";

import { PhoneVerificationFlow } from "./PhoneVerificationFlow";
import { useGetUserInfoQuery } from "../api/useGetUserInfoQuery";
import { useUpdateUserInfoMutation } from "../api/useUpdateUserInfoMutation";
import {
  type AgreementKey,
  type AgreementValues,
  userInfoToAgreements,
} from "../lib/adapters";
import { FIELD_LABEL_CLASS, SECTION_TITLE_CLASS } from "../lib/formClasses";

interface LoginInfoSectionProps {
  className?: string;
}

interface NotificationOption {
  key: AgreementKey;
  titleKey: string;
  descriptionKey: string;
}

const NOTIFICATION_OPTIONS: ReadonlyArray<NotificationOption> = [
  {
    key: "newProductAgreed",
    titleKey: "new_arrivals_alerts",
    descriptionKey: "personal_offers_alerts",
  },
  {
    key: "adAgreed",
    titleKey: "marketing_promotion_emails",
    descriptionKey: "ongoing_promotion_notification",
  },
  {
    key: "recommendAgreed",
    titleKey: "personalized_product_suggestions",
    descriptionKey: "personal_offers_alerts",
  },
];

const EMPTY_AGREEMENTS: AgreementValues = {
  newProductAgreed: false,
  adAgreed: false,
  recommendAgreed: false,
};

function AccountValueField({
  value,
  placeholder,
  verified,
  unverifiedMessage,
  onClick,
}: {
  value: string;
  placeholder?: string;
  verified: boolean;
  unverifiedMessage?: string;
  onClick?(): void;
}) {
  const t = useTranslations();
  const hasValue = value.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-[10px]">
        <div className="flex h-[48px] flex-1 items-center justify-between rounded-[4px] border border-black/20 px-[12px]">
          <span
            className={cn(
              "text-body-2",
              hasValue ? "text-black" : "text-black/40",
            )}
          >
            {hasValue ? value : (placeholder ?? "")}
          </span>
          {verified ? (
            <CheckCircle2 className="text-info size-[18px] shrink-0" />
          ) : (
            <CircleAlert className="text-error size-[18px] shrink-0" />
          )}
        </div>
        <Button
          className="h-[48px] shrink-0 px-[16px]"
          onClick={onClick}
          type="button"
          variant={verified ? "outline" : "default"}
        >
          {verified ? t("modify") : t("verification")}
        </Button>
      </div>
      {verified || !unverifiedMessage ? null : (
        <span className="text-body-5 text-error">{unverifiedMessage}</span>
      )}
    </div>
  );
}

interface NotificationFormProps {
  email: string;
  defaultValues?: AgreementValues;
  submitting?: boolean;
  onSubmit(values: AgreementValues): void;
}

function NotificationForm({
  email,
  defaultValues,
  submitting = false,
  onSubmit,
}: NotificationFormProps) {
  const t = useTranslations();
  const base = defaultValues ?? EMPTY_AGREEMENTS;
  const [agreements, setAgreements] = useState<AgreementValues>(() => base);

  const isDirty = NOTIFICATION_OPTIONS.some(
    (option) => agreements[option.key] !== base[option.key],
  );

  return (
    <>
      <div className="flex flex-col gap-5">
        <h3 className={SECTION_TITLE_CLASS}>{t("promotion_benefits")}</h3>
        <div className="flex flex-col gap-2">
          <Label className={FIELD_LABEL_CLASS}>{t("email_address")}</Label>
          <div className="flex h-[48px] items-center justify-between rounded-[4px] border border-black/20 px-[12px]">
            <span className="text-body-2 text-black">{email}</span>
            <CheckCircle2 className="text-info size-[18px] shrink-0" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-body-3 text-black/50">{t("email_phone")}</span>
          <div className="flex flex-col gap-5">
            {NOTIFICATION_OPTIONS.map((option) => {
              const active = agreements[option.key];

              return (
                <button
                  className="flex items-start gap-[10px] text-left"
                  key={option.key}
                  onClick={() =>
                    setAgreements((prev) => ({
                      ...prev,
                      [option.key]: !prev[option.key],
                    }))
                  }
                  type="button"
                >
                  <span
                    className={cn(
                      "mt-px flex size-[16px] shrink-0 items-center justify-center rounded-full border transition-colors",
                      active
                        ? "border-black bg-black text-white"
                        : "border-black/30 bg-white",
                    )}
                  >
                    {active ? <Check className="size-[12px]" /> : null}
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="text-body-3 text-black">
                      {t(option.titleKey)}
                    </span>
                    <span className="text-body-5 text-black/40">
                      {t(option.descriptionKey)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Button
        className="h-[56px] w-full"
        disabled={!isDirty || submitting}
        onClick={() => onSubmit(agreements)}
        size="lg"
        type="button"
      >
        {t("save_changes")}
      </Button>
    </>
  );
}

export function LoginInfoSection({ className }: LoginInfoSectionProps) {
  const t = useTranslations();
  const { data: userInfo, isLoading } = useGetUserInfoQuery();
  const { mutate: updateInfo, isPending } = useUpdateUserInfoMutation();

  const [isPhoneFlowOpen, setIsPhoneFlowOpen] = useState(false);

  const email = userInfo?.email ?? "";
  const phone = userInfo?.phone ?? "";
  const phoneVerified = Boolean(userInfo?.phone);

  const handleSubmit = (agreements: AgreementValues) => {
    if (!userInfo) return;

    updateInfo(agreements, {
      onSuccess: () => toast.success(t("changes_saved")),
    });
  };

  return (
    <section
      className={cn(
        "flex w-[598px] flex-col gap-10 max-sm:w-full max-sm:gap-8",
        className,
      )}
    >
      <h2 className="text-title-4 sm:text-title-3 font-bold text-black">
        {t("login_info")}
      </h2>

      <div className="flex flex-col gap-5">
        <h3 className={SECTION_TITLE_CLASS}>{t("my_account_2")}</h3>
        <div className="flex flex-col gap-2">
          <Label className={FIELD_LABEL_CLASS}>{t("mobile_number")}</Label>
          <AccountValueField
            onClick={() => setIsPhoneFlowOpen(true)}
            placeholder={t("number_not_registered")}
            unverifiedMessage={t("verify_your_number")}
            value={phone}
            verified={phoneVerified}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-body-3 text-black/40">{t("loading")}</p>
      ) : (
        <NotificationForm
          defaultValues={userInfo ? userInfoToAgreements(userInfo) : undefined}
          email={email}
          key={userInfo ? "loaded" : "empty"}
          onSubmit={handleSubmit}
          submitting={isPending}
        />
      )}

      <PhoneVerificationFlow
        onOpenChange={setIsPhoneFlowOpen}
        open={isPhoneFlowOpen}
      />
    </section>
  );
}
