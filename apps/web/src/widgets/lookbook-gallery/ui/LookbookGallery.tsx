import { cn } from "@shared/lib/style";

import { LookbookItem } from "@entities/lookbook";

interface LookbookGalleryProps {
  className?: string;
}

export function LookbookGallery({ className }: LookbookGalleryProps) {
  // Placeholder data
  const items = Array.from({ length: 9 });

  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-[20px] [grid-auto-rows:412px]",
        "max-sm:gap-0 max-sm:[grid-auto-rows:120px]",
        className,
      )}
    >
      {items.map((_, index) => (
        <LookbookItem className="border border-slate-50" key={`${index + 1}`} />
      ))}
    </div>
  );
}
