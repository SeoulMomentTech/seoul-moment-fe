import { BaseImage } from "@shared/ui/base-image";
import { Card } from "@shared/ui/card";

import { cn } from "@seoul-moment/ui";

interface MegazineCardProps {
  title: string;
  imageUrl: string;
}

export function MegazineCard({ title, imageUrl }: MegazineCardProps) {
  return (
    <Card
      className={cn("w-[400px] gap-[20px]", "max-sm:w-auto")}
      image={
        <BaseImage
          alt=""
          className={cn(
            "h-[260px] bg-slate-300",
            "max-sm:h-[210px] max-sm:w-full",
          )}
          height={260}
          src={imageUrl}
          width={400}
        />
      }
      title={
        <span className="max-sm:font-semibold">
          {title}
          {title}
        </span>
      }
    />
  );
}
