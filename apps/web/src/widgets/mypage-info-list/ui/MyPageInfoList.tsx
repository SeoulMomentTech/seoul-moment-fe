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

/** 모바일은 사이드바가 없어 쇼핑 정보 중 별도 화면인 주문내역을 여기서 연다 */
const SHOPPING_ITEMS: ReadonlyArray<InfoItem> = [
  { labelKey: "order_history", href: "/mypage/order" },
];

const ITEMS: ReadonlyArray<InfoItem> = [
  { labelKey: "login_info", href: "/mypage/login-info" },
  { labelKey: "profile_settings", href: "/mypage/profile" },
  { labelKey: "personalized_info", href: "/mypage/custom-info" },
];

function InfoGroup({
  title,
  items,
}: {
  title: string;
  items: ReadonlyArray<InfoItem>;
}) {
  const t = useTranslations();

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-body-1 font-bold text-black">{title}</h2>
      <ul className="flex flex-col">
        {items.map((item) => (
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

export default function MyPageInfoList({ className }: MyPageInfoListProps) {
  const t = useTranslations();

  return (
    <div className={cn("flex flex-col gap-[30px]", className)}>
      <InfoGroup items={SHOPPING_ITEMS} title={t("shopping_info")} />
      <InfoGroup items={ITEMS} title={t("my_profile")} />
    </div>
  );
}
