"use client";

import { ChevronLeftIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";

import { Link } from "@/i18n/navigation";

interface MyPageBackLinkProps {
  /** 돌아갈 상위 화면. 주소로 바로 들어와도 엉뚱한 곳으로 가지 않게 history 대신 경로로 보낸다 */
  href: string;
  className?: string;
}

/** 모바일은 사이드바가 없어 마이페이지 하위 화면에서 상위로 돌아갈 길이 없다. 그 자리를 채운다 */
export function MyPageBackLink({ href, className }: MyPageBackLinkProps) {
  const t = useTranslations();

  return (
    <Link
      className={cn(
        "text-body-3 -ml-1 inline-flex w-fit items-center gap-0.5 py-1 text-black/60 transition-colors hover:text-black sm:hidden",
        className,
      )}
      href={href}
    >
      <ChevronLeftIcon aria-hidden className="size-5" />
      {t("back")}
    </Link>
  );
}
