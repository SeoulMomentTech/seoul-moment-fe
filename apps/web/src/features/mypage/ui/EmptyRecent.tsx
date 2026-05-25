"use client";

import { Search } from "lucide-react";

import { cn } from "@shared/lib/style";

import { useRouter } from "@/i18n/navigation";

import { Button } from "@seoul-moment/ui";

interface EmptyRecentProps {
  className?: string;
}

export function EmptyRecent({ className }: EmptyRecentProps) {
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
        최근 본 상품이 아직 없어요.
        <br />
        요즘 많이 찾는 아이템을 구경해보세요.
      </p>
      <Button
        onClick={() => router.push("/product")}
        size="md"
        type="button"
        variant="outline"
      >
        인기 상품 보기
      </Button>
    </div>
  );
}
