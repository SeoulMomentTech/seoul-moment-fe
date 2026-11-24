import { cn } from "@shared/lib/style";

const DELIVERY_STEPS = 6;

interface OrderDeliveryProgressProps {
  /** 서버 배송 단계 문구 (商品準備中 …) */
  label: string;
  /** 진행바 위치 (1~6) */
  step: number;
  className?: string;
}

/**
 * 배송 6단계 진행바. 결제·취소·환불 상태와 독립이라 취소된 주문에는 그리지 않는다
 * (`showsDeliveryProgress`). 목록 카드와 주문 상세가 같이 쓴다.
 */
export function OrderDeliveryProgress({
  label,
  step,
  className,
}: OrderDeliveryProgressProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <p className="text-body-4 flex justify-between gap-2">
        <span className="font-semibold">{label}</span>
        <span className="text-neutral tabular-nums">
          {step}/{DELIVERY_STEPS}
        </span>
      </p>
      <div
        aria-label={label}
        aria-valuemax={DELIVERY_STEPS}
        aria-valuemin={1}
        aria-valuenow={step}
        className="grid grid-cols-6 gap-1"
        role="progressbar"
      >
        {Array.from({ length: DELIVERY_STEPS }, (_, index) => (
          <span
            className={cn("h-1", index < step ? "bg-black" : "bg-black/10")}
            key={index}
          />
        ))}
      </div>
    </div>
  );
}
