import { useState } from "react";

import { AlertTriangle } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@shared/components/page-header";
import type { AdminShippingPolicy } from "@shared/services/shipping";
import { formatCurrency } from "@shared/utils/format";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Skeleton,
  Switch,
  cn,
} from "@seoul-moment/ui";

import {
  useAdminShippingPolicyQuery,
  useUpdateAdminShippingPolicyMutation,
} from "./hooks";
import { formatAmountInput, parseAmountInput } from "./lib/amountInput";
import { buildPolicyPatch, type EditablePolicy } from "./lib/policyPatch";

/** 서버가 계산하는 구간 할인. 화면 설명에만 쓴다 (NT$4,000 이상 구간별 하나) */
const DISCOUNT_TIERS = [120, 250, 450, 700];
const DISCOUNT_START = 4000;

const policySchema = z.object({
  freeShippingThreshold: z
    .number({ message: "금액을 입력해주세요" })
    .int("정수로 입력해주세요")
    .min(0, "0 이상이어야 합니다"),
  internationalDiscountEnabled: z.boolean(),
});

export function ShippingPolicyPage() {
  const { data, isLoading } = useAdminShippingPolicyQuery();
  const policy = data?.data;

  return (
    <div className="p-8 pt-24">
      <PageHeader
        description="무료배송 기준과 국제배송비 지원 할인을 설정합니다. 이미 만든 주문은 바뀌지 않습니다."
        title="배송비 정책"
      />

      {isLoading || !policy ? (
        <div className="max-w-2xl space-y-3 rounded-lg border border-gray-200 bg-white p-6">
          <Skeleton className="h-5 w-40" rounded />
          <Skeleton className="h-9 w-full" rounded />
          <Skeleton className="h-16 w-full" rounded />
        </div>
      ) : (
        // 저장 뒤 서버 값이 바뀌면 폼을 새 값으로 다시 시작한다
        <PolicyForm
          key={`${policy.freeShippingThreshold}-${policy.internationalDiscountEnabled}`}
          policy={policy}
        />
      )}
    </div>
  );
}

function PolicyForm({ policy }: { policy: AdminShippingPolicy }) {
  const saved: EditablePolicy = {
    freeShippingThreshold: policy.freeShippingThreshold,
    internationalDiscountEnabled: policy.internationalDiscountEnabled,
  };

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EditablePolicy>({
    resolver: zodResolver(policySchema),
    mode: "onChange",
    defaultValues: saved,
  });

  const [pendingValues, setPendingValues] = useState<EditablePolicy | null>(
    null,
  );
  const { mutate, isPending } = useUpdateAdminShippingPolicyMutation();

  const values = watch();
  const isDirty =
    Object.keys(
      buildPolicyPatch(saved, {
        freeShippingThreshold: values.freeShippingThreshold,
        internationalDiscountEnabled: values.internationalDiscountEnabled,
      }),
    ).length > 0;

  const save = (next: EditablePolicy) => {
    mutate(buildPolicyPatch(saved, next), {
      onSuccess: () => {
        toast.success("배송비 정책을 저장했습니다.");
        setPendingValues(null);
      },
      onError: () => setPendingValues(null),
    });
  };

  const onSubmit = (next: EditablePolicy) => {
    // 켜는 순간부터 결제·발표에 음수 줄이 나간다. 한 번 더 확인받는다
    if (next.internationalDiscountEnabled && !saved.internationalDiscountEnabled) {
      setPendingValues(next);
      return;
    }
    save(next);
  };

  return (
    <form
      className="max-w-2xl space-y-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">현재 배송비</h2>
        <dl className="mt-3 grid grid-cols-3 gap-4 text-sm">
          <div>
            <dt className="text-xs text-gray-500">본섬 배송비</dt>
            <dd className="mt-1 tabular-nums">
              {formatCurrency(policy.baseFee)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">외섬 배송비</dt>
            <dd className="mt-1 tabular-nums">
              {formatCurrency(policy.remoteIslandFee)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">외섬 프로모션</dt>
            <dd className="mt-1">
              {policy.remoteIslandPromotion ? "진행 중 (본섬 요금 적용)" : "꺼짐"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-1.5">
          <Label htmlFor="free-shipping-threshold">무료배송 임계금액</Label>
          <Controller
            control={control}
            name="freeShippingThreshold"
            render={({ field }) => (
              <div
                className={cn(
                  "duration-normal flex h-9 w-56 items-center rounded-md border bg-white transition-colors focus-within:ring-2",
                  errors.freeShippingThreshold
                    ? "border-red-500 focus-within:ring-red-100"
                    : "border-gray-300 focus-within:border-gray-900 focus-within:ring-gray-100",
                )}
              >
                <span className="pl-3 text-sm text-gray-500">NT$</span>
                {/* 쉼표를 찍어 보여주려고 type="number" 대신 text + numeric 키패드를 쓴다 */}
                <input
                  aria-describedby="free-shipping-threshold-hint"
                  aria-invalid={Boolean(errors.freeShippingThreshold)}
                  autoComplete="off"
                  className="h-full min-w-0 flex-1 bg-transparent px-2 text-right text-sm tabular-nums outline-none"
                  id="free-shipping-threshold"
                  inputMode="numeric"
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    // 비우면 NaN 으로 둬서 검증("금액을 입력해주세요")에 걸리게 한다
                    field.onChange(parseAmountInput(event.target.value) ?? NaN)
                  }
                  ref={field.ref}
                  value={formatAmountInput(
                    Number.isNaN(field.value) ? null : field.value,
                  )}
                />
              </div>
            )}
          />
          <div
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"
            id="free-shipping-threshold-hint"
          >
            {errors.freeShippingThreshold ? (
              <p className="text-red-600">
                {errors.freeShippingThreshold.message}
              </p>
            ) : (
              <p className="text-gray-500">
                저장된 값 {formatCurrency(saved.freeShippingThreshold)} · 할인
                스위치와 별개 설정입니다.
              </p>
            )}
            {/* 할인을 켤 때는 임계금액도 할인 시작 금액에 맞춘다 (문서 06) */}
            {values.internationalDiscountEnabled &&
              values.freeShippingThreshold !== DISCOUNT_START && (
                <button
                  className="font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600"
                  onClick={() =>
                    setValue("freeShippingThreshold", DISCOUNT_START, {
                      shouldValidate: true,
                    })
                  }
                  type="button"
                >
                  {formatCurrency(DISCOUNT_START)}으로 맞추기
                </button>
              )}
          </div>
        </div>

        <div className="flex items-start justify-between gap-6 border-t border-gray-100 pt-6">
          <div>
            <Label htmlFor="international-discount">국제배송비 지원 할인</Label>
            <p className="mt-1 text-xs text-gray-500">
              NT${DISCOUNT_START.toLocaleString()} 이상 주문에 구간별로 하나씩
              적용: {DISCOUNT_TIERS.map((amount) => formatCurrency(amount)).join(" / ")}
            </p>
          </div>
          <Controller
            control={control}
            name="internationalDiscountEnabled"
            render={({ field }) => (
              <Switch
                checked={field.value}
                // 공용 Switch 의 bg-primary·bg-input 토큰이 어드민 테마에 없어 트랙 색을 직접 준다
                className="data-[state=checked]:bg-gray-900 data-[state=unchecked]:bg-gray-300"
                id="international-discount"
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-6">
          <Button
            disabled={!isDirty || isPending}
            onClick={() => reset(saved)}
            type="button"
            variant="outline"
          >
            되돌리기
          </Button>
          <Button disabled={!isDirty || isPending} type="submit">
            {isPending ? "저장 중…" : "저장"}
          </Button>
        </div>
      </section>

      <Dialog
        onOpenChange={(open) => !open && setPendingValues(null)}
        open={pendingValues !== null}
      >
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>국제배송비 지원 할인을 켤까요?</DialogTitle>
            <DialogDescription>
              켜는 즉시 장바구니·주문서 금액에 할인이 반영됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 rounded-md bg-orange-50 px-3 py-2.5 text-sm text-orange-800">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              LINE Pay 결제와 전자발표에 할인이 음수 줄로 나갑니다. DEV
              sandbox 에서 결제 1건·발표 1건을 확인한 뒤에 켜주세요.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setPendingValues(null)}
              type="button"
              variant="outline"
            >
              취소
            </Button>
            <Button
              disabled={isPending}
              onClick={() => pendingValues && save(pendingValues)}
              type="button"
            >
              {isPending ? "저장 중…" : "켜고 저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
