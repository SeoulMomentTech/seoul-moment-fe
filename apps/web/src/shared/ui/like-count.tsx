"use client";

import { HeartIcon } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import { setComma } from "@shared/lib/utils";

interface LikeCountProps {
  className?: string;
  countClassName?: string;
  iconSize?: number;
  count?: number;
  active?: boolean;
  disabled?: boolean;
  onClick?(): void;
}

export function LikeCount({
  className,
  iconSize,
  count,
  countClassName,
  active = false,
  disabled = false,
  onClick,
}: LikeCountProps) {
  const t = useTranslations();
  const size = iconSize ?? 14;
  const colorClass = active ? "text-red-500" : "text-black/40";
  const content = (
    <>
      <HeartIcon
        className={colorClass}
        fill={active ? "currentColor" : "none"}
        height={size}
        width={size}
      />
      {count != null && count > 0 && (
        <span className={cn("text-body-4", countClassName)}>
          {setComma(count)}
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        aria-label={active ? t("unlike") : t("like")}
        aria-pressed={active}
        className={cn(
          "flex cursor-pointer items-center gap-[4px] disabled:opacity-50",
          colorClass,
          className,
        )}
        disabled={disabled}
        onClick={onClick}
        type="button"
      >
        {content}
      </button>
    );
  }

  return (
    <div className={cn("flex items-center gap-[4px]", colorClass, className)}>
      {content}
    </div>
  );
}
