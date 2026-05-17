"use client";

import { type ReactNode, useId, useState } from "react";

import { ChevronRight } from "lucide-react";

import { cn } from "@shared/lib/style";

import { Button, Input, Label } from "@seoul-moment/ui";

import { SizeSelectModal } from "./SizeSelectModal";
import { SIZE_FIELDS, type SizeType } from "../lib/sizeOptions";

const SECTION_TITLE_CLASS = "text-body-1 font-semibold text-black";
const FIELD_LABEL_CLASS = "text-body-3 text-black";

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
          {hasValue ? value : "선택하기"}
        </span>
        <ChevronRight className="size-[14px] text-black/40" />
      </span>
    </button>
  );
}

const INITIAL_SIZE_VALUES: Partial<Record<SizeType, string>> = {};

export interface CustomInfoFormValues {
  height: string;
  weight: string;
  sizeValues: Partial<Record<SizeType, string>>;
}

interface CustomInfoFormProps {
  heightLabel: string;
  weightLabel: string;
  submitLabel: string;
  onSubmit?(values: CustomInfoFormValues): void;
  footer?: ReactNode;
  className?: string;
}

export function CustomInfoForm({
  heightLabel,
  weightLabel,
  submitLabel,
  onSubmit,
  footer,
  className,
}: CustomInfoFormProps) {
  const fieldId = useId();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [sizeValues, setSizeValues] =
    useState<Partial<Record<SizeType, string>>>(INITIAL_SIZE_VALUES);
  const [openType, setOpenType] = useState<SizeType | null>(null);

  const activeField =
    SIZE_FIELDS.find((field) => field.type === openType) ?? null;

  const isDirty =
    height.trim() !== "" ||
    weight.trim() !== "" ||
    SIZE_FIELDS.some(
      (field) => sizeValues[field.type] !== INITIAL_SIZE_VALUES[field.type],
    );

  return (
    <div className={cn("flex flex-col gap-10 max-sm:gap-8", className)}>
      <div className="flex flex-col gap-5">
        <h3 className={SECTION_TITLE_CLASS}>체형 정보</h3>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className={FIELD_LABEL_CLASS} htmlFor={`${fieldId}-height`}>
              {heightLabel}
            </Label>
            <Input
              id={`${fieldId}-height`}
              inputMode="numeric"
              onChange={(e) =>
                setHeight(clampNumeric(e.target.value, MAX_HEIGHT))
              }
              placeholder="키를 입력하세요"
              value={height}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className={FIELD_LABEL_CLASS} htmlFor={`${fieldId}-weight`}>
              {weightLabel}
            </Label>
            <Input
              id={`${fieldId}-weight`}
              inputMode="numeric"
              onChange={(e) =>
                setWeight(clampNumeric(e.target.value, MAX_WEIGHT))
              }
              placeholder="몸무게를 입력하세요"
              value={weight}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <h3 className={SECTION_TITLE_CLASS}>사이즈 정보</h3>
        <div className="flex flex-col">
          {SIZE_FIELDS.map((field) => (
            <SizeRowButton
              key={field.type}
              label={field.label}
              onClick={() => setOpenType(field.type)}
              value={sizeValues[field.type]}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Button
          className="max-sm:text-body-2 h-[56px] w-full max-sm:h-[48px]"
          disabled={!isDirty}
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
          title={activeField.modalTitle}
          value={sizeValues[activeField.type]}
        />
      ) : null}
    </div>
  );
}
