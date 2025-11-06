import { cn } from "@shared/lib/style";

interface NewsCardProps {
  category: string;
  title: string;
  imageUrl: string;
}

export function NewsCard({ category, title, imageUrl }: NewsCardProps) {
  return (
    <div
      className={cn(
        "flex gap-[20px] border-b border-b-black/10 pb-[20px]",
        "max-sm:flex-row-reverse max-sm:justify-between",
      )}
    >
      <div
        className="min-h-[90px] min-w-[90px] bg-slate-300"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="flex flex-col justify-center gap-[10px]">
        <span className="text-body-4">{category}</span>
        <p className="text-body-2 font-semibold">{title}</p>
      </div>
    </div>
  );
}
