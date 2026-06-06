"use client";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";

import { Link, usePathname } from "@/i18n/navigation";

import { SIDEBAR_GROUPS, type SidebarItem } from "../model/navigation";

interface MyPageSidebarProps {
  className?: string;
}

function SidebarGroup({
  title,
  items,
  pathname,
}: {
  title: string;
  items: ReadonlyArray<SidebarItem>;
  pathname: string;
}) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-body-1 font-semibold text-black">{title}</h3>
      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                className={cn(
                  "text-body-2 inline-block transition-colors",
                  active
                    ? "font-semibold text-black"
                    : "text-black/50 hover:text-black",
                )}
                href={item.href}
              >
                {t(item.labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function MyPageSidebar({ className }: MyPageSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <aside className={cn("flex flex-col gap-10", className)}>
      <Link href="/mypage">
        <h1 className="text-title-3 font-bold text-black">{t("my_account")}</h1>
      </Link>
      {SIDEBAR_GROUPS.map((group) => (
        <SidebarGroup
          items={group.items}
          key={group.titleKey}
          pathname={pathname}
          title={t(group.titleKey)}
        />
      ))}
    </aside>
  );
}
