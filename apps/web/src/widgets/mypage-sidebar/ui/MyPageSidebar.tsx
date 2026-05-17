"use client";

import { cn } from "@shared/lib/style";

import { Link, usePathname } from "@/i18n/navigation";

interface MyPageSidebarProps {
  className?: string;
}

interface SidebarItem {
  label: string;
  href: string;
}

const SHOPPING_GROUP: ReadonlyArray<SidebarItem> = [
  { label: "관심", href: "/mypage/interest" },
];

const MY_INFO_GROUP: ReadonlyArray<SidebarItem> = [
  { label: "로그인 정보", href: "/mypage/login-info" },
  { label: "프로필 관리", href: "/mypage" },
  { label: "나의 맞춤 정보", href: "/mypage/custom-info" },
];

function SidebarGroup({
  title,
  items,
  pathname,
}: {
  title: string;
  items: ReadonlyArray<SidebarItem>;
  pathname: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-body-1 font-semibold text-black">{title}</h3>
      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const active = item.href !== "/mypage" && pathname === item.href;

          return (
            <li key={item.label}>
              <Link
                className={cn(
                  "text-body-2 inline-block transition-colors",
                  active
                    ? "font-semibold text-black"
                    : "text-black/50 hover:text-black",
                )}
                href={item.href}
              >
                {item.label}
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

  return (
    <aside className={cn("flex flex-col gap-10", className)}>
      <Link href="/mypage">
        <h1 className="text-title-3 font-bold text-black">마이페이지</h1>
      </Link>
      <SidebarGroup
        items={SHOPPING_GROUP}
        pathname={pathname}
        title="쇼핑 정보"
      />
      <SidebarGroup items={MY_INFO_GROUP} pathname={pathname} title="내 정보" />
    </aside>
  );
}
