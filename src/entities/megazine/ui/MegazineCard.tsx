import Image from "next/image";
import { Card } from "@shared/ui/card";

interface MegazineCardProps {
  title: string;
  imageUrl: string;
}

export function MegazineCard({ title, imageUrl }: MegazineCardProps) {
  return (
    <Card
      className="gap-[20px]"
      image={
        <Image
          alt=""
          className="h-[260px] w-[400px] bg-slate-300 max-sm:h-[210px] max-sm:w-full"
          height={260}
          src={imageUrl}
          width={400}
        />
      }
      title={<span className="max-sm:font-semibold">{title}</span>}
    />
  );
}
