import { LookbookItem } from "@/entities/lookbook";
import { cn } from "@/shared/lib/style";

interface LookbookGalleryProps {
  className?: string;
}

export function LookbookGallery({ className }: LookbookGalleryProps) {
  // Placeholder data
  const items = Array.from({ length: 9 });

  return (
    <div
      className={cn(
        "grid [grid-auto-rows:412px] grid-cols-3 gap-[20px]",
        "max-sm:[grid-auto-rows:120px] max-sm:gap-0",
        className,
      )}
    >
      {items.map((_, index) => (
        <LookbookItem className="border border-slate-50" key={`${index + 1}`} />
      ))}
    </div>
  );
}
