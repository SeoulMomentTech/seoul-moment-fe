"use client";

import { Link } from "@/i18n/navigation";
import { MegazineCard } from "@entities/megazine";

interface Magazine {
  id: number;
  title: string;
  banner: string;
}

interface MoreMagazineListProps {
  magazines: Magazine[];
  type: "news" | "article";
}

export function MoreMagazineList({ magazines, type }: MoreMagazineListProps) {
  return (
    <div className="flex gap-[40px] max-sm:hidden">
      {magazines.map((magazine) => (
        <Link href={`/${type}/${magazine.id}`} key={magazine.id}>
          <MegazineCard imageUrl={magazine.banner} title={magazine.title} />
        </Link>
      ))}
    </div>
  );
}
