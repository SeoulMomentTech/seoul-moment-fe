"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

import { cn, VStack } from "@seoul-moment/ui";

export function LoginTerms() {
  const t = useTranslations();

  return (
    <VStack className="w-full pt-[20px]" gap={10}>
      <p
        className={cn(
          "text-body-3 w-full text-center leading-none text-black/80",
          "max-md:text-body-4",
        )}
      >
        {t("login_consent_text")}
      </p>
      <Link
        className={cn(
          "text-body-3 w-full cursor-pointer text-center leading-none text-black/60 underline",
          "max-sm:text-body-4",
        )}
        href="/terms"
      >
        {t("terms_and_privacy")}
      </Link>
    </VStack>
  );
}
