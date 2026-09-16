import type { ReactNode } from "react";

import { EMPTY_VALUE } from "@shared/utils/format";

import { cn } from "@seoul-moment/ui";

interface MemberDetailCardProps {
  title: string;
  /** 블록 자체가 없을 때 대신 보여줄 문구 */
  placeholder?: string;
  children?: ReactNode;
}

export function MemberDetailCard({
  title,
  placeholder,
  children,
}: MemberDetailCardProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <h3 className="border-b border-gray-200 px-5 py-3 text-sm font-semibold text-gray-900">
        {title}
      </h3>
      {placeholder ? (
        <p className="px-5 py-6 text-sm text-gray-500">{placeholder}</p>
      ) : (
        <dl className="divide-y divide-gray-100">{children}</dl>
      )}
    </section>
  );
}

interface MemberDetailRowProps {
  label: string;
  children?: ReactNode;
  /** 값이 비었을 때 EMPTY_VALUE 로 대체할지. 직접 노드를 넘기면 false 로 둔다 */
  className?: string;
}

export function MemberDetailRow({
  label,
  children,
  className,
}: MemberDetailRowProps) {
  return (
    <div className="grid grid-cols-[92px_1fr] gap-3 px-5 py-2.5">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className={cn("break-words text-sm text-gray-900", className)}>
        {children ?? <span className="text-gray-500">{EMPTY_VALUE}</span>}
      </dd>
    </div>
  );
}
