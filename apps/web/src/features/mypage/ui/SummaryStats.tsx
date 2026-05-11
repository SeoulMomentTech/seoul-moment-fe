import {
  FileTextIcon,
  MessageSquareTextIcon,
  TicketIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@shared/lib/style";

interface StatItem {
  key: string;
  label: string;
  icon: "seller" | "op" | LucideIcon;
  value?: string;
}

const STATS: ReadonlyArray<StatItem> = [
  { key: "seller_grade", label: "판매자등급", icon: "seller", value: "S" },
  { key: "op", label: "0P", icon: "op" },
  { key: "coupon", label: "쿠폰 25", icon: TicketIcon },
  { key: "review", label: "리뷰", icon: MessageSquareTextIcon },
  { key: "invite", label: "친구초대", icon: UsersIcon },
  { key: "notice", label: "공지사항", icon: FileTextIcon },
];

function StatIcon({ icon, value }: Pick<StatItem, "icon" | "value">) {
  if (icon === "seller") {
    return (
      <div className="flex size-9 items-center justify-center rounded-full bg-black text-[14px] font-bold text-white">
        {value ?? "S"}
      </div>
    );
  }
  if (icon === "op") {
    return (
      <div className="flex size-9 items-center justify-center rounded-full border border-black/15 text-[12px] font-semibold text-black/60">
        P
      </div>
    );
  }
  const Icon = icon;
  return (
    <div className="flex size-9 items-center justify-center">
      <Icon className="size-6 text-black/70" />
    </div>
  );
}

interface SummaryStatsProps {
  className?: string;
}

export function SummaryStats({ className }: SummaryStatsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-6 items-center gap-2 rounded-[12px] border border-black/10 px-4 py-6",
        "max-sm:grid-cols-3 max-sm:gap-y-4",
        className,
      )}
    >
      {STATS.map((stat) => (
        <div
          className="flex flex-col items-center justify-center gap-2 text-center"
          key={stat.key}
        >
          <StatIcon icon={stat.icon} value={stat.value} />
          <span className="text-body-4 text-black/70">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
