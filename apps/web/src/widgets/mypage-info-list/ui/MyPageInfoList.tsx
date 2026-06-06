"use client";

import { ChevronRightIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";

import { Link } from "@/i18n/navigation";

interface MyPageInfoListProps {
  className?: string;
}

interface InfoItem {
  labelKey: string;
  href: string;
}

const ITEMS: ReadonlyArray<InfoItem> = [
  { labelKey: "login_info", href: "/mypage" },
  { labelKey: "profile_settings", href: "/mypage" },
  { labelKey: "personalized_info", href: "/mypage" },
];

export default function MyPageInfoList({ className }: MyPageInfoListProps) {
  const t = useTranslations();

  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <h2 className="text-body-1 font-bold text-black">{t("my_profile")}</h2>
      <ul className="flex flex-col">
        {ITEMS.map((item) => (
          <li key={item.labelKey}>
            <Link
              className="text-body-3 flex items-center justify-between border-b border-black/10 py-[16px] text-black/80 transition-colors last:border-b-0 hover:text-black"
              href={item.href}
            >
              <span>{t(item.labelKey)}</span>
              <ChevronRightIcon className="size-5 text-black/30" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
