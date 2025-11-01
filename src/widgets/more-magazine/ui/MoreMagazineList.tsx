"use client";

import { MegazineCard } from "@entities/megazine";

interface Magazine {
  id: number;
  title: string;
  banner: string;
}

interface MoreMagazineListProps {
  magazines: Magazine[];
}

export function MoreMagazineList({ magazines }: MoreMagazineListProps) {
  return (
    <div className="flex gap-[40px] max-sm:hidden">
      {magazines.map((magazine) => (
        <MegazineCard
          imageUrl={magazine.banner}
          key={magazine.id}
          title={magazine.title}
        />
      ))}
    </div>
  );
}
