import type { ReactNode } from "react";

import { cn } from "../lib/style";

/** 진행(주황)·완료(초록)·실패(빨강)·없음(회색). 결제 대기·결과처럼 "지금 상태" 를 알리는 화면용 */
export type StatusTone = "progress" | "success" | "danger" | "muted";

const MARK_TONE: Record<StatusTone, string> = {
  progress: "bg-brand/10 text-brand",
  // 초록은 디자인 토큰에 없어 이 카드에서만 쓴다(백엔드 결제 지도의 완료 색)
  success: "bg-[#e6f2ec] text-[#2f7d5d]",
  danger: "bg-danger/10 text-danger",
  muted: "bg-black/5 text-black/40",
};

interface StatusCardProps {
  tone: StatusTone;
  icon: ReactNode;
  title: string;
  description?: string;
  /** 진행 중 — 마크 둘레의 링이 돈다 */
  spinning?: boolean;
  /** 제목 아래 짧은 정보(주문번호·알약) */
  meta?: ReactNode;
  /** 정보 박스·안내 박스 */
  children?: ReactNode;
  /** 하단 버튼 줄. 버튼은 같은 폭으로 나뉜다 */
  actions?: ReactNode;
  className?: string;
}

/**
 * 가운데 정렬 상태 카드. 데스크톱은 폭 480px 카드, 모바일은 화면 폭을 다 쓴다.
 * 마크는 상태 색 원형, 진행 중이면 둘레 링이 돌아 "기다리는 중" 을 알린다(동작 줄이기 설정이면 멈춘다).
 */
export function StatusCard({
  tone,
  icon,
  title,
  description,
  spinning = false,
  meta,
  children,
  actions,
  className,
}: StatusCardProps) {
  return (
    <section
      className={cn(
        "mx-auto w-full max-w-[480px] overflow-hidden rounded-[8px] border border-black/10 bg-white",
        className,
      )}
    >
      <div
        className={cn(
          "grid justify-items-center gap-2 px-8 pb-6 pt-10 text-center",
          "max-sm:px-5 max-sm:pt-8",
        )}
      >
        <div
          className={cn(
            "relative mb-2 grid size-16 place-items-center rounded-full",
            MARK_TONE[tone],
          )}
          data-spinning={spinning}
          data-testid="status-mark"
          data-tone={tone}
        >
          {icon}
          {spinning && (
            <span
              aria-hidden
              className="border-t-brand absolute -inset-1.5 animate-spin rounded-full border-2 border-transparent motion-reduce:animate-none"
            />
          )}
        </div>
        <h2 className="text-title-4 font-bold tracking-[-0.02em]">{title}</h2>
        {description && (
          <p className="text-body-3 text-neutral leading-relaxed" role="status">
            {description}
          </p>
        )}
        {meta && (
          <div className="mt-1 grid justify-items-center gap-2">{meta}</div>
        )}
      </div>

      {children && (
        <div className="grid gap-3 px-8 pb-6 max-sm:px-5">{children}</div>
      )}

      {actions && (
        <div
          className={cn(
            "flex gap-2 border-t border-black/5 px-8 py-4 max-sm:px-5",
            "[&>*]:h-12 [&>*]:flex-1 [&>*]:rounded-[4px]",
          )}
        >
          {actions}
        </div>
      )}
    </section>
  );
}

/** 주문번호·결제수단 같은 짧은 값을 담는 주황 알약 */
export function StatusPill({ children }: { children: ReactNode }) {
  return (
    <span className="bg-brand/10 text-body-5 inline-block rounded-full px-3 py-1 font-mono font-semibold tabular-nums text-[#b5541a]">
      {children}
    </span>
  );
}

export interface StatusInfoRow {
  label: string;
  value: ReactNode;
  /** 합계 행 — 위에 선을 긋고 굵게 */
  total?: boolean;
}

/** 라벨·값 정보 박스(결제 일시·수단·금액, 가상계좌 등) */
export function StatusInfo({ rows }: { rows: ReadonlyArray<StatusInfoRow> }) {
  return (
    <dl className="text-body-4 grid rounded-[8px] bg-black/[0.03] px-4 py-3">
      {rows.map((row) => (
        <div
          className={cn(
            "flex items-center justify-between gap-4 py-1",
            row.total &&
              "text-body-3 mt-1.5 border-t border-black/10 pt-2.5 font-bold",
          )}
          data-total={row.total ?? false}
          key={row.label}
        >
          <dt className={cn(!row.total && "text-neutral")}>{row.label}</dt>
          <dd className="text-right font-semibold tabular-nums">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

type NoticeTone = "neutral" | "warn" | "danger";

const NOTICE_TONE: Record<NoticeTone, string> = {
  neutral: "bg-black/[0.03] text-black/70",
  warn: "bg-brand/10 text-[#b5541a]",
  danger: "bg-danger/10 text-black/80",
};

/** 한두 줄 안내 박스 */
export function StatusNotice({
  tone = "neutral",
  children,
}: {
  tone?: NoticeTone;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "text-body-4 rounded-[8px] px-4 py-3 text-left leading-relaxed",
        NOTICE_TONE[tone],
      )}
      data-tone={tone}
    >
      {children}
    </p>
  );
}
