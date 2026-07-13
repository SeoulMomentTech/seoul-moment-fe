import {
  FileTextIcon,
  MessageSquareTextIcon,
  HeartIcon,
  type LucideIcon,
} from "lucide-react";

import { capitalize } from "es-toolkit";
import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";

interface StatItem {
  key: string;
  icon: LucideIcon;
  value?: string;
}

const STATS: ReadonlyArray<StatItem> = [
  { key: "like", icon: HeartIcon },
  { key: "review", icon: MessageSquareTextIcon },
  { key: "notice", icon: FileTextIcon },
];

function StatIcon({ icon }: Pick<StatItem, "icon">) {
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
  const t = useTranslations();

  return (
    <div
      className={cn(
        "grid grid-cols-6 items-center gap-2 rounded-[12px] border border-black/10 px-4 py-6",
        "max-sm:grid-cols-3 max-sm:gap-y-4 max-sm:rounded-none max-sm:border-x-0 max-sm:border-b-0 max-sm:px-0 max-sm:pb-0",
        className,
      )}
    >
      {STATS.map((stat) => (
        <div
          className="flex flex-col items-center justify-center gap-2 text-center"
          key={stat.key}
        >
          <StatIcon icon={stat.icon} />
          <span className="text-body-4 text-black/70">
            {capitalize(t(stat.key))}
          </span>
        </div>
      ))}
    </div>
  );
}
