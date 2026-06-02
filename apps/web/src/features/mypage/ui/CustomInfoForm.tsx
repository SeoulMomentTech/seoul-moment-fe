"use client";

import { type ReactNode, useId, useState } from "react";

import { ChevronRight } from "lucide-react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";

import { Button, Input, Label } from "@seoul-moment/ui";

import { SizeSelectModal } from "./SizeSelectModal";
import { type CustomInfoFormValues } from "../lib/adapters";
import {
  FIELD_LABEL_CLASS,
  INPUT_CLASS,
  SECTION_TITLE_CLASS,
} from "../lib/formClasses";
import { SIZE_FIELDS, type SizeType } from "../lib/sizeOptions";

export type { CustomInfoFormValues } from "../lib/adapters";

const MAX_HEIGHT = 250;
const MAX_WEIGHT = 300;

function clampNumeric(raw: string, max: number): string {
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return "";
  return String(Math.min(Number(digits), max));
}

function SizeRowButton({
  label,
  value,
  onClick,
}: {
  label: string;
  value?: string;
  onClick(): void;
}) {
  const t = useTranslations();
  const hasValue = Boolean(value);

  return (
    <button
      className="hover:bg-black/2 flex items-center justify-between border-b border-black/10 py-[16px] text-left transition-colors"
      onClick={onClick}
      type="button"
    >
      <span className="text-body-2 text-black">{label}</span>
      <span className="flex items-center gap-[8px]">
        <span
          className={cn(
            "text-body-2",
            hasValue ? "text-black" : "text-black/40",
          )}
        >
          {hasValue ? value : t("select_2")}
        </span>
        <ChevronRight className="size-[14px] text-black/40" />
      </span>
    </button>
  );
}

interface CustomInfoFormProps {
  heightLabel: string;
  weightLabel: string;
  submitLabel: string;
  defaultValues?: CustomInfoFormValues;
  submitting?: boolean;
  /**
   * true(기본): 모든 필드 입력 시에만 제출 가능 (온보딩 등 전체 입력 요구)
   * false: 1개 이상 입력 시 제출 가능 (부분 업데이트 허용)
   */
  requireComplete?: boolean;
  onSubmit?(values: CustomInfoFormValues): void;
  footer?: ReactNode;
  className?: string;
}

export function CustomInfoForm({
  heightLabel,
  weightLabel,
  submitLabel,
  defaultValues,
  submitting = false,
  requireComplete = true,
  onSubmit,
  footer,
  className,
}: CustomInfoFormProps) {
  const t = useTranslations();
  const fieldId = useId();
  const [height, setHeight] = useState(() => defaultValues?.height ?? "");
  const [weight, setWeight] = useState(() => defaultValues?.weight ?? "");
  const [sizeValues, setSizeValues] = useState<
    Partial<Record<SizeType, string>>
  >(() => defaultValues?.sizeValues ?? {});
  const [openType, setOpenType] = useState<SizeType | null>(null);

  const activeField =
    SIZE_FIELDS.find((field) => field.type === openType) ?? null;

  const isComplete =
    height.trim() !== "" &&
    weight.trim() !== "" &&
    SIZE_FIELDS.every((field) => Boolean(sizeValues[field.type]));

  const hasAnyValue =
    height.trim() !== "" ||
    weight.trim() !== "" ||
    SIZE_FIELDS.some((field) => Boolean(sizeValues[field.type]));

  const canSubmit = requireComplete ? isComplete : hasAnyValue;

  return (
    <div className={cn("flex flex-col gap-10 max-sm:gap-8", className)}>
      <div className="flex flex-col gap-5">
        <h3 className={SECTION_TITLE_CLASS}>{t("body_info")}</h3>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className={FIELD_LABEL_CLASS} htmlFor={`${fieldId}-height`}>
              {heightLabel}
            </Label>
            <Input
              className={INPUT_CLASS}
              id={`${fieldId}-height`}
              inputMode="numeric"
              onChange={(e) =>
                setHeight(clampNumeric(e.target.value, MAX_HEIGHT))
              }
              placeholder={t("enter_height")}
              value={height}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className={FIELD_LABEL_CLASS} htmlFor={`${fieldId}-weight`}>
              {weightLabel}
            </Label>
            <Input
              className={INPUT_CLASS}
              id={`${fieldId}-weight`}
              inputMode="numeric"
              onChange={(e) =>
                setWeight(clampNumeric(e.target.value, MAX_WEIGHT))
              }
              placeholder={t("enter_weight")}
              value={weight}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <h3 className={SECTION_TITLE_CLASS}>{t("size_info")}</h3>
        <div className="flex flex-col">
          {SIZE_FIELDS.map((field) => (
            <SizeRowButton
              key={field.type}
              label={t(field.labelKey)}
              onClick={() => setOpenType(field.type)}
              value={sizeValues[field.type]}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Button
          className="max-sm:text-body-2 h-[56px] w-full max-sm:h-[48px]"
          disabled={!canSubmit || submitting}
          onClick={() => onSubmit?.({ height, weight, sizeValues })}
          size="lg"
          type="button"
        >
          {submitLabel}
        </Button>
        {footer}
      </div>

      {activeField ? (
        <SizeSelectModal
          onConfirm={(value) =>
            setSizeValues((prev) => ({ ...prev, [activeField.type]: value }))
          }
          onOpenChange={(open) => {
            if (!open) setOpenType(null);
          }}
          open={openType !== null}
          options={activeField.options}
          title={t(activeField.modalTitleKey)}
          value={sizeValues[activeField.type]}
        />
      ) : null}
    </div>
  );
}
