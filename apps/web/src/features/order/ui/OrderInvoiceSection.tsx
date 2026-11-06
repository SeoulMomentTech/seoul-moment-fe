"use client";

import { useId, type ReactNode } from "react";

import { useTranslations } from "next-intl";

import { cn } from "@shared/lib/style";
import type { UserOrderInvoiceType } from "@shared/services/userOrder";

import { Input, Label, RadioGroup, RadioGroupItem } from "@seoul-moment/ui";

import { FieldLabel, INPUT_CLASS, TWO_COLUMN_CLASS } from "./orderFields";
import {
  INVOICE_TYPES,
  toDigits,
  type OrderInvoiceValues,
} from "../model/invoiceSchema";
import type {
  InvoiceCheckState,
  useOrderInvoice,
} from "../model/useOrderInvoice";

const TYPE_LABEL_KEY: Record<UserOrderInvoiceType, string> = {
  MEMBER_CARRIER: "invoice_type_member_carrier",
  MOBILE_BARCODE: "invoice_type_mobile_barcode",
  CITIZEN_CERT: "invoice_type_citizen_cert",
  DONATION: "invoice_type_donation",
  COMPANY: "invoice_type_company",
};

interface OrderInvoiceSectionProps {
  invoice: ReturnType<typeof useOrderInvoice>;
}

/**
 * 전자발표 받는 방법. 결제 수단과 같은 라디오 카드이고, 고른 카드 안에서만 그 타입의 칸이
 * 펼쳐진다. 다른 타입에 적어 둔 값은 숨길 뿐 지우지 않는다(모델이 들고 있다).
 */
export function OrderInvoiceSection({ invoice }: OrderInvoiceSectionProps) {
  const t = useTranslations();
  const groupId = useId();
  const { type, setType } = invoice;

  return (
    <RadioGroup
      className="gap-2.5"
      onValueChange={(next) => setType(next as UserOrderInvoiceType)}
      value={type}
    >
      {INVOICE_TYPES.map((item) => {
        const id = `${groupId}-${item}`;
        const selected = type === item;

        return (
          <div
            className={cn(
              "border p-4",
              selected
                ? "border-black"
                : "border-black/20 hover:border-black/40",
            )}
            key={item}
          >
            <Label
              className="text-body-3 flex cursor-pointer items-center gap-3"
              htmlFor={id}
            >
              <RadioGroupItem id={id} value={item} />
              {t(TYPE_LABEL_KEY[item])}
            </Label>
            {selected && (
              <div className="mt-3">
                <InvoicePanel invoice={invoice} type={item} />
              </div>
            )}
          </div>
        );
      })}
    </RadioGroup>
  );
}

interface InvoicePanelProps {
  invoice: ReturnType<typeof useOrderInvoice>;
  type: UserOrderInvoiceType;
}

/** 고른 타입의 입력칸. 회원 載具는 안내 한 줄뿐이다 */
function InvoicePanel({ invoice, type }: InvoicePanelProps) {
  const t = useTranslations();
  const {
    form: {
      register,
      formState: { errors },
    },
    check,
    confirmField,
  } = invoice;

  const field = (name: Exclude<keyof OrderInvoiceValues, "type">) => {
    const registered = register(name);

    return {
      ...registered,
      onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
        const result = registered.onBlur(event);
        confirmField();

        return result;
      },
    };
  };

  /** 숫자 칸은 숫자 아닌 입력을 화면에도 남기지 않는다 */
  const digitsField = (name: "loveCode" | "companyTaxId") => {
    const registered = field(name);

    return {
      ...registered,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        event.target.value = toDigits(event.target.value);

        return registered.onChange(event);
      },
    };
  };

  /** 서버가 "등록되지 않은 값" 이라고 한 칸은 형식 오류와 같은 모양으로 표시한다 */
  const serverInvalid = check.status === "invalid";

  const errorFor = (name: Exclude<keyof OrderInvoiceValues, "type">) =>
    errors[name]?.message ? t(errors[name].message) : undefined;

  switch (type) {
    case "MEMBER_CARRIER":
      return (
        <p className="text-body-5 text-neutral">
          {t("invoice_member_carrier_hint")}
        </p>
      );

    case "MOBILE_BARCODE":
      return (
        <InvoiceField
          check={check}
          error={errorFor("mobileBarcode")}
          id="order-invoice-mobile-barcode"
        >
          <Input
            aria-describedby="order-invoice-mobile-barcode-status"
            aria-invalid={!!errors.mobileBarcode || serverInvalid}
            autoCapitalize="characters"
            className={cn(
              INPUT_CLASS,
              (errors.mobileBarcode || serverInvalid) && "border-danger",
            )}
            id="order-invoice-mobile-barcode"
            placeholder="/ABC1234"
            {...field("mobileBarcode")}
          />
        </InvoiceField>
      );

    case "CITIZEN_CERT":
      return (
        <InvoiceField
          check={check}
          error={errorFor("citizenCert")}
          id="order-invoice-citizen-cert"
        >
          <Input
            aria-describedby="order-invoice-citizen-cert-status"
            aria-invalid={!!errors.citizenCert}
            autoCapitalize="characters"
            className={cn(INPUT_CLASS, errors.citizenCert && "border-danger")}
            id="order-invoice-citizen-cert"
            placeholder="AB12345678901234"
            {...field("citizenCert")}
          />
        </InvoiceField>
      );

    case "DONATION":
      return (
        <InvoiceField
          check={check}
          error={errorFor("loveCode")}
          id="order-invoice-love-code"
          label={t("invoice_love_code_label")}
          // 확인되면 ✓ 대신 기부처 이름을 보여준다
          verifiedText={check.name ?? undefined}
        >
          <Input
            aria-describedby="order-invoice-love-code-status"
            aria-invalid={!!errors.loveCode || serverInvalid}
            className={cn(
              INPUT_CLASS,
              "tabular-nums",
              (errors.loveCode || serverInvalid) && "border-danger",
            )}
            id="order-invoice-love-code"
            inputMode="numeric"
            placeholder="168001"
            {...digitsField("loveCode")}
          />
        </InvoiceField>
      );

    case "COMPANY":
      return (
        <div className={TWO_COLUMN_CLASS}>
          <InvoiceField
            check={check}
            error={errorFor("companyTaxId")}
            id="order-invoice-company-tax-id"
            label={t("invoice_company_tax_id_label")}
          >
            <Input
              aria-describedby="order-invoice-company-tax-id-status"
              aria-invalid={!!errors.companyTaxId || serverInvalid}
              className={cn(
                INPUT_CLASS,
                "tabular-nums",
                (errors.companyTaxId || serverInvalid) && "border-danger",
              )}
              id="order-invoice-company-tax-id"
              inputMode="numeric"
              placeholder="97025978"
              {...digitsField("companyTaxId")}
            />
          </InvoiceField>
          <div className="grid gap-2">
            <Label
              className="text-body-3 text-black"
              htmlFor="order-invoice-company-name"
            >
              {t("invoice_company_name_label")}
            </Label>
            <Input
              aria-describedby="order-invoice-company-name-status"
              aria-invalid={!!errors.companyName}
              className={cn(INPUT_CLASS, errors.companyName && "border-danger")}
              id="order-invoice-company-name"
              placeholder={t("invoice_company_name_placeholder")}
              {...register("companyName")}
            />
            <StatusLine
              id="order-invoice-company-name-status"
              text={errorFor("companyName")}
              tone="danger"
            />
          </div>
        </div>
      );
  }
}

interface InvoiceFieldProps {
  id: string;
  label?: string;
  error?: string;
  check: InvoiceCheckState;
  /** 확인됐을 때 ✓ 문구 대신 보여줄 글(기부처 이름) */
  verifiedText?: string;
  children: ReactNode;
}

/** 라벨 + 입력 + 상태 한 줄. 폼 에러가 확인 상태보다 먼저다 */
function InvoiceField({
  id,
  label,
  error,
  check,
  verifiedText,
  children,
}: InvoiceFieldProps) {
  const t = useTranslations();

  const status = (): { text?: string; tone: StatusTone } => {
    if (error) return { text: error, tone: "danger" };

    switch (check.status) {
      case "checking":
        return { text: t("invoice_checking"), tone: "neutral" };
      case "invalid":
        return { text: t("invoice_check_not_found"), tone: "danger" };
      case "valid":
        return {
          text: verifiedText ?? t("invoice_check_verified"),
          tone: "black",
        };
      case "unverified":
        return { text: t("invoice_check_unverified"), tone: "neutral" };
      case "idle":
        return { tone: "neutral" };
    }
  };

  const { text, tone } = status();

  return (
    <div className="grid gap-2">
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      {children}
      <StatusLine id={`${id}-status`} text={text} tone={tone} />
    </div>
  );
}

type StatusTone = "danger" | "neutral" | "black";

const TONE_CLASS: Record<StatusTone, string> = {
  danger: "text-danger",
  neutral: "text-neutral",
  black: "text-black",
};

/** 항상 한 줄 높이를 차지해 문구가 생겼다 사라져도 칸이 뛰지 않는다 */
function StatusLine({
  id,
  text,
  tone,
}: {
  id: string;
  text?: string;
  tone: StatusTone;
}) {
  return (
    <p
      // 글자 크기는 cn 밖에 둔다(tailwind-merge 가 text-body-* 를 색으로 보고 지운다)
      className={`text-body-5 ${cn("min-h-4 leading-4", TONE_CLASS[tone])}`}
      id={id}
      // role 을 바꾸면 문구가 바뀌는 순간 live region 이 아니어서 읽어 주지 않는다 — 고정한다
      role="status"
    >
      {text}
    </p>
  );
}
