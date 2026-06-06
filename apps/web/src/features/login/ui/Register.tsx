"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

import { cn } from "@seoul-moment/ui";

export function Register() {
  const t = useTranslations();

  return (
    <div
      className={cn(
        "mt-10 flex w-full justify-center gap-1 border-t border-t-black/10 pt-10",
        "max-md:mt-0 max-md:border-t-0 max-md:pt-[50px]",
      )}
    >
      <span>{t("no_account_yet")}</span>
      <Link className="text-black/60" href="/signup">
        {t("signup_now")}
      </Link>
    </div>
  );
}
