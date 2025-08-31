import { Card } from "@/shared/ui/card";

export default function MegazineCard() {
  return (
    <Card
      className="gap-[20px]"
      image={<div className="h-[260px] w-[400px] bg-slate-300" />}
      title={<span>Ep.00 우산</span>}
    />
  );
}
