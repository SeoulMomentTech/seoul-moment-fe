import type { ReactNode } from "react";

import type { GetAdminMemberSummaryResponse } from "@shared/services/member";
import { formatNumber } from "@shared/utils/format";

import { Skeleton, cn } from "@seoul-moment/ui";

import {
  MEMBER_PROVIDERS,
  MEMBER_PROVIDER_BAR_CLASS,
  MEMBER_PROVIDER_LABEL,
} from "../../constants";

interface MemberSummaryStripProps {
  summary?: GetAdminMemberSummaryResponse;
  isLoading: boolean;
}

interface SummaryCellProps {
  label: string;
  value: string;
  className?: string;
  tone?: "default" | "muted";
}

function SummaryCell({
  label,
  value,
  className,
  tone = "default",
}: SummaryCellProps) {
  return (
    <div className={cn("px-4 py-4 lg:px-6", className)}>
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={cn(
          "mt-1 text-xl font-semibold tabular-nums lg:text-2xl",
          tone === "muted" ? "text-gray-500" : "text-gray-900",
        )}
      >
        {value}
      </p>
    </div>
  );
}

/**
 * 요약은 목록 필터와 무관한 전체 집계다. 목록 카드 안에 넣으면
 * 필터에 반응하는 숫자로 읽히므로 별도 카드로 세운다.
 */
function SummaryCard({ children }: { children: ReactNode }) {
  return (
    <section
      aria-label="전체 회원 현황"
      className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
    >
      <header className="border-b border-gray-200 px-4 py-2.5 lg:px-6">
        <p className="text-xs text-gray-500">
          전체 회원 현황
          <span className="text-gray-500">
            {" "}
            · 목록 필터와 무관하게 집계됩니다
          </span>
        </p>
      </header>
      {children}
    </section>
  );
}

export function MemberSummaryStrip({
  summary,
  isLoading,
}: MemberSummaryStripProps) {
  if (isLoading) {
    return (
      <SummaryCard>
        <div className="grid grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_1.4fr]">
          {[
            "summary-total",
            "summary-new",
            "summary-withdrawn",
            "summary-provider",
          ].map((key, index) => (
            <div
              className={cn(
                "px-4 py-4 lg:px-6",
                index < 2 && "border-r border-gray-200",
                index === 2 && "lg:border-r lg:border-gray-200",
                index === 3 &&
                  "col-span-3 border-t border-gray-200 lg:col-span-1 lg:border-t-0",
              )}
              key={key}
            >
              <Skeleton className="h-3 w-16" rounded />
              <Skeleton className="mt-2 h-6 w-20" rounded />
            </div>
          ))}
        </div>
      </SummaryCard>
    );
  }

  if (!summary) {
    return null;
  }

  const providerTotal = MEMBER_PROVIDERS.reduce(
    (acc, provider) => acc + summary.byProvider[provider],
    0,
  );

  return (
    <SummaryCard>
      <div className="grid grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_1.4fr]">
        <SummaryCell
          className="border-r border-gray-200"
          label="활성 회원"
          value={formatNumber(summary.total)}
        />
        <SummaryCell
          className="border-r border-gray-200"
          label="최근 7일 신규"
          value={`+${formatNumber(summary.newIn7Days)}`}
        />
        <SummaryCell
          className="lg:border-r lg:border-gray-200"
          label="누적 탈퇴"
          tone="muted"
          value={formatNumber(summary.withdrawn)}
        />

        <div className="col-span-3 border-t border-gray-200 px-4 py-4 lg:col-span-1 lg:border-t-0 lg:px-6">
          <p className="text-xs text-gray-500">가입 경로</p>

          <div className="mt-2 flex h-2 max-w-[360px] overflow-hidden rounded-full bg-gray-100">
            {providerTotal > 0 &&
              MEMBER_PROVIDERS.map((provider) => (
                <div
                  className={MEMBER_PROVIDER_BAR_CLASS[provider]}
                  key={provider}
                  style={{
                    width: `${(summary.byProvider[provider] / providerTotal) * 100}%`,
                  }}
                />
              ))}
          </div>

          <ul className="mt-2.5 flex max-w-[360px] flex-wrap gap-x-4 gap-y-1">
            {MEMBER_PROVIDERS.map((provider) => {
              const count = summary.byProvider[provider];
              const share =
                providerTotal > 0
                  ? Math.round((count / providerTotal) * 100)
                  : 0;

              return (
                <li
                  className="flex items-center gap-1.5 text-xs"
                  key={provider}
                >
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      MEMBER_PROVIDER_BAR_CLASS[provider],
                    )}
                  />
                  <span className="text-gray-600">
                    {MEMBER_PROVIDER_LABEL[provider]}
                  </span>
                  <span className="font-medium tabular-nums text-gray-900">
                    {formatNumber(count)}
                  </span>
                  <span className="tabular-nums text-gray-500">{share}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </SummaryCard>
  );
}
