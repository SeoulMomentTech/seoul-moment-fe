import type { ReactNode } from "react";

import { cn } from "@seoul-moment/ui";

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  /** 제목 오른쪽에 붙는 버튼 등 */
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-xs font-medium text-gray-500">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Row({
  label,
  children,
  strong = false,
}: {
  label: string;
  children: ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd
        className={cn(
          "text-right tabular-nums text-gray-900",
          strong && "font-semibold",
        )}
      >
        {children}
      </dd>
    </div>
  );
}

export function StatusBadge({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** 회색 안내 문구 */
export function Hint({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-gray-500">{children}</p>;
}
