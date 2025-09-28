import Image from "next/image";
import { cn } from "@/shared/lib/style";

interface AvatarBadgeProps {
  className?: string;
  avatarUrl?: string;
  name?: string;
}

export function AvatarBadge({ className, name, avatarUrl }: AvatarBadgeProps) {
  return (
    <div className={cn("flex items-center gap-[4px]", className)}>
      <div
        className={cn(
          "h-[32px] w-[32px] overflow-hidden rounded-full border border-black/10",
          "max-sm:h-[24px] max-sm:w-[24px]",
        )}
      >
        <Image
          alt={name ?? ""}
          className="h-full w-full"
          height={32}
          src={avatarUrl ?? ""}
          width={32}
        />
      </div>
      {name && <span className="text-body-3">{name}</span>}
    </div>
  );
}
