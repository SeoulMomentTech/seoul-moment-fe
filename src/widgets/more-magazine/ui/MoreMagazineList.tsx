"use client";

import { MegazineCard } from "@/entities/megazine";

export default function MoreMagazineList() {
  return (
    <div className="flex gap-[40px] max-sm:hidden">
      <MegazineCard />
      <MegazineCard />
      <MegazineCard />
    </div>
  );
}
