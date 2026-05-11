"use client";

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
        "flex flex-col items-center justify-center gap-4 rounded-[8px] border border-dashed border-black/15 px-6 py-[60px] text-center",
        className,
      )}
    >
      <p className="text-body-3 leading-relaxed text-black/50">
        최근 본 상품이 아직 없어요.
        <br />
        다양한 상품을 둘러보고 마음에 드는 상품을 만나보세요.
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
