"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useForm } from "react-hook-form";

import type {
  UserOrderInvoice,
  UserOrderInvoiceType,
} from "@shared/services/userOrder";

import {
  fetchUserInvoiceCheck,
  useUserInvoiceCompanyCheckQuery,
  useUserInvoiceLoveCodeCheckQuery,
  useUserInvoiceMobileBarcodeCheckQuery,
} from "@entities/invoice";
import { useQueryClient } from "@tanstack/react-query";

import {
  INVOICE_CHECK_FIELD,
  INVOICE_DEFAULT_VALUES,
  isValidCompanyTaxId,
  isValidLoveCode,
  isValidMobileBarcode,
  orderInvoiceResolver,
  orderInvoiceSchema,
  toDigits,
  toInvoiceFormField,
  toMobileBarcode,
  toSubmitInvoice,
  type InvoiceServerField,
  type OrderInvoiceValues,
} from "./invoiceSchema";

export type InvoiceCheckStatus =
  | "idle"
  | "checking"
  | "valid"
  | "invalid"
  | "unverified";

export interface InvoiceCheckState {
  status: InvoiceCheckStatus;
  /** 愛心碼의 기부처 이름 또는 統一編號의 회사명. 확인됐을 때만 */
  name?: string | null;
}

/** 서버 확인 API 가 있는 타입. 自然人憑證·회원 載具는 형식만 본다 */
type CheckableType = "MOBILE_BARCODE" | "DONATION" | "COMPANY";

type CheckedValues = Record<CheckableType, string>;

const EMPTY_CHECKED: CheckedValues = {
  MOBILE_BARCODE: "",
  DONATION: "",
  COMPANY: "",
};

const isCheckable = (type: UserOrderInvoiceType): type is CheckableType =>
  INVOICE_CHECK_FIELD[type] !== null;

/** 폼 값에서 확인 API 에 보낼 값(정규화)을 타입별로 뽑는다 */
const toCheckedValues = (values: OrderInvoiceValues): CheckedValues => ({
  MOBILE_BARCODE: toMobileBarcode(values.mobileBarcode),
  DONATION: toDigits(values.loveCode),
  COMPANY: toDigits(values.companyTaxId),
});

/** 타입별로 제출에 실리는(= 에러를 볼) 폼 칸 */
const FIELDS_OF_TYPE: Record<
  UserOrderInvoiceType,
  ReadonlyArray<Exclude<keyof OrderInvoiceValues, "type">>
> = {
  MEMBER_CARRIER: [],
  MOBILE_BARCODE: ["mobileBarcode"],
  CITIZEN_CERT: ["citizenCert"],
  DONATION: ["loveCode"],
  COMPANY: ["companyTaxId", "companyName"],
};

const FORMAT_CHECK: Record<CheckableType, (value: string) => boolean> = {
  MOBILE_BARCODE: isValidMobileBarcode,
  DONATION: isValidLoveCode,
  COMPANY: isValidCompanyTaxId,
};

/**
 * 전자발표 입력 모델.
 *
 * 확인 API 는 키 입력마다가 아니라 **blur 때 확정된 값**(`checked`)으로만 나간다. 타입마다
 * 확정값을 따로 들고 있어서 타입을 바꿨다 돌아와도 이전 확인 결과(쿼리 캐시)가 그대로 보인다.
 * `valid: false` 만 결제를 막고, 재정부 장애(`verified: false`)와 API 실패는 통과시킨다 —
 * 주문 생성이 같은 검사를 다시 하므로 여기서 막으면 장애 때 아무도 주문을 못 한다.
 */
export const useOrderInvoice = () => {
  const form = useForm<OrderInvoiceValues>({
    resolver: orderInvoiceResolver,
    defaultValues: INVOICE_DEFAULT_VALUES,
    mode: "onBlur",
  });
  const {
    watch,
    getValues,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = form;

  const values = watch();
  const type = values.type;

  const [checked, setChecked] = useState<CheckedValues>(EMPTY_CHECKED);
  const queryClient = useQueryClient();

  const current = useMemo(() => toCheckedValues(values), [values]);

  const enabledFor = (candidate: CheckableType) =>
    type === candidate && FORMAT_CHECK[candidate](checked[candidate]);

  // 훅 규칙상 셋 다 항상 부르고 enabled 로 가른다. 꺼진 쿼리는 요청을 보내지 않는다.
  const mobileQuery = useUserInvoiceMobileBarcodeCheckQuery(
    checked.MOBILE_BARCODE,
    { enabled: enabledFor("MOBILE_BARCODE") },
  );
  const loveQuery = useUserInvoiceLoveCodeCheckQuery(checked.DONATION, {
    enabled: enabledFor("DONATION"),
  });
  const companyQuery = useUserInvoiceCompanyCheckQuery(checked.COMPANY, {
    enabled: enabledFor("COMPANY"),
  });

  const check = useMemo<InvoiceCheckState>(() => {
    if (!isCheckable(type)) return { status: "idle" };

    const query = {
      MOBILE_BARCODE: mobileQuery,
      DONATION: loveQuery,
      COMPANY: companyQuery,
    }[type];
    const confirmed = checked[type];

    // 확정값이 없거나, 형식이 틀리거나, 확정 뒤 다시 고쳤으면 보여줄 결과가 없다
    if (!FORMAT_CHECK[type](confirmed) || confirmed !== current[type])
      return { status: "idle" };

    if (query.isLoading) return { status: "checking" };
    if (query.isError) return { status: "unverified" };
    if (!query.data) return { status: "idle" };
    if (!query.data.valid) return { status: "invalid" };

    return query.data.verified
      ? { status: "valid", name: query.data.name }
      : { status: "unverified" };
  }, [type, checked, current, mobileQuery, loveQuery, companyQuery]);

  const isFormatValid = orderInvoiceSchema.safeParse(values).success;
  // 주문 생성 400 으로 건 서버 에러(applyServerFieldError)는 형식·확인 결과와 별개로 막는다.
  // 사용자가 그 칸을 고쳐 다시 blur 하면 리졸버가 지운다.
  const hasFieldError = FIELDS_OF_TYPE[type].some((field) => !!errors[field]);
  const isValid =
    isFormatValid &&
    !hasFieldError &&
    (!isCheckable(type) ||
      check.status === "valid" ||
      check.status === "unverified");

  /**
   * 결제 버튼을 열어도 되는지. 형식만 맞으면 아직 blur 로 확인되지 않은 값도 허용한다 —
   * 제출 핸들러가 `ensureChecked` 로 확인을 끝내고 기다린다. 확인 결과가 "등록되지 않음"
   * 이거나 서버가 거절한 칸은 막는다.
   */
  const isSubmittable =
    isFormatValid && !hasFieldError && check.status !== "invalid";

  const submitInvoice = useMemo(
    () => (isValid ? toSubmitInvoice(values) : undefined),
    [isValid, values],
  );

  // 統一編號가 확인돼 회사명이 왔고 칸이 비어 있으면 채운다. 사용자가 적은 값은 덮지 않는다.
  const companyName =
    type === "COMPANY" && check.status === "valid" ? check.name : null;
  useEffect(
    function fillCompanyName() {
      if (companyName && !getValues("companyName").trim())
        setValue("companyName", companyName, { shouldDirty: true });
    },
    [companyName, getValues, setValue],
  );

  const setType = useCallback(
    (next: UserOrderInvoiceType) =>
      setValue("type", next, { shouldDirty: true }),
    [setValue],
  );

  /** blur: 현재 타입의 칸 값을 확정해 확인 API 를 켠다 */
  const confirmField = useCallback(() => {
    const currentType = getValues("type");
    if (!isCheckable(currentType)) return;

    const next = toCheckedValues(getValues())[currentType];
    setChecked((prev) =>
      prev[currentType] === next ? prev : { ...prev, [currentType]: next },
    );
  }, [getValues]);

  /** 주문 생성 400 의 data.field 를 현재 타입의 칸에 건다 */
  const applyServerFieldError = useCallback(
    (field: InvoiceServerField) => {
      const formField = toInvoiceFormField(field, getValues("type"));
      if (formField)
        setError(formField, {
          type: "server",
          message: "invoice_check_not_found",
        });
    },
    [getValues, setError],
  );

  /**
   * 제출 직전: 현재 값을 확정하고 확인 API 를 기다린다. 형식이 틀리거나 `valid: false` 면
   * `ok: false`(칸에 문구가 이미/곧 뜬다). API 실패·`verified: false` 는 통과시킨다.
   */
  const ensureChecked = useCallback(async (): Promise<
    { ok: true; invoice: UserOrderInvoice | undefined } | { ok: false }
  > => {
    const current = getValues();
    if (!orderInvoiceSchema.safeParse(current).success) return { ok: false };

    const currentType = current.type;
    if (!isCheckable(currentType))
      return { ok: true, invoice: toSubmitInvoice(current) };

    const value = toCheckedValues(current)[currentType];
    setChecked((prev) =>
      prev[currentType] === value ? prev : { ...prev, [currentType]: value },
    );

    try {
      const data = await fetchUserInvoiceCheck(queryClient, currentType, value);
      if (!data.valid) return { ok: false };
    } catch {
      // 확인을 못 한 것은 거절이 아니다 — 주문 생성이 같은 검사를 다시 한다
    }

    return { ok: true, invoice: toSubmitInvoice(current) };
  }, [getValues, queryClient]);

  const getDraft = useCallback(() => getValues(), [getValues]);

  /** 지도에서 돌아온 draft. 복원값을 확정값으로 삼아 확인 API 가 한 번 나간다(캐시가 있으면 즉시) */
  const restoreDraft = useCallback(
    (draft: OrderInvoiceValues | undefined) => {
      if (!draft) return;

      reset(draft);
      setChecked(toCheckedValues(draft));
    },
    [reset],
  );

  return {
    form,
    type,
    setType,
    confirmField,
    check,
    isValid,
    isSubmittable,
    ensureChecked,
    submitInvoice,
    applyServerFieldError,
    getDraft,
    restoreDraft,
  };
};
