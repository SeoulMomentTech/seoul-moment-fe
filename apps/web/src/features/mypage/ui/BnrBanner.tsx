import { cn } from "@shared/lib/style";

interface BnrBannerProps {
  className?: string;
}

export function BnrBanner({ className }: BnrBannerProps) {
  return (
    <div
      className={cn(
        "flex h-20 items-center justify-center rounded-[8px] bg-black/5 text-[18px] text-black/30",
        className,
      )}
    >
      BNR
    </div>
  );
}
