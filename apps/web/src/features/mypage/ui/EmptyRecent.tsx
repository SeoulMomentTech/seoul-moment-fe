"use client";

import { Search } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";

import { useRouter } from "@/i18n/navigation";

import { Button } from "@seoul-moment/ui";

interface EmptyRecentProps {
  className?: string;
}

export function EmptyRecent({ className }: EmptyRecentProps) {
  const t = useTranslations();
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-[60px] text-center",
        className,
      )}
    >
      <Search className="size-6 text-black/40" strokeWidth={1.5} />
      <p className="text-body-3 leading-relaxed text-black/50">
        {t("no_viewed_products")}
        <br />
        {t("discover_products")}
      </p>
      <Button
        onClick={() => router.push("/product")}
        size="md"
        type="button"
        variant="outline"
      >
        {t("view_popular_products")}
      </Button>
    </div>
  );
}
