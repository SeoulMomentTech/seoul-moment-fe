import { Card } from "@/shared/ui/card";

interface MegazineCardProps {
  title: string;
}

export function MegazineCard({ title }: MegazineCardProps) {
  return (
    <Card
      className="gap-[20px]"
      image={
        <div className="h-[260px] w-[400px] bg-slate-300 max-sm:h-[210px] max-sm:w-full" />
      }
      title={<span className="max-sm:font-semibold">{title}</span>}
    />
  );
}
