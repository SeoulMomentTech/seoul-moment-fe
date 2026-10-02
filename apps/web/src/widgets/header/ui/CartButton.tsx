"use client";

import { ShoppingCartIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import {
  useUserAuthHydrated,
  useUserAuthStore,
} from "@shared/lib/hooks/useUserAuthStore";
import { cn } from "@shared/lib/style";

import { Link } from "@/i18n/navigation";

import { useCartBadgeCount } from "@entities/cart";

interface CartButtonProps {
  iconSize?: number;
  className?: string;
}

const MAX_BADGE_COUNT = 99;

/**
 * 헤더 장바구니 진입점.
 *
 * 배지는 **라인 개수**다(수량 합이 아니다). 숫자의 근거(서버 카운트)와 캐시 복원 대기는
 * `useCartBadgeCount` 가 쥐고 있다.
 */
export function CartButton({ iconSize = 22, className }: CartButtonProps) {
  const t = useTranslations();
  const isAuthenticated = useUserAuthStore((state) => state.isAuthenticated);
  const hasAuthHydrated = useUserAuthHydrated();
  const { count, isReady } = useCartBadgeCount();

  if (!hasAuthHydrated || !isAuthenticated) return null;

  const showBadge = isReady && count > 0;

  return (
    <Link
      aria-label={
        showBadge
          ? `${t("cart")} ${t("cart_item_count", { count })}`
          : t("cart")
      }
      className={cn("relative block", className)}
      href="/cart"
    >
      <ShoppingCartIcon height={iconSize} strokeWidth={1.6} width={iconSize} />
      {showBadge && (
        <span
          className={cn(
            "bg-brand absolute -right-1.5 -top-1 flex h-[17px] min-w-[17px] items-center justify-center",
            "rounded-full px-1 text-[10.5px] font-semibold tabular-nums leading-none text-white",
          )}
        >
          {count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : count}
        </span>
      )}
    </Link>
  );
}
