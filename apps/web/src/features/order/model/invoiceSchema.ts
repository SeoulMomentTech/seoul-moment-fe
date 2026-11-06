import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type {
  UserOrderInvoice,
  UserOrderInvoiceType,
} from "@shared/services/userOrder";

/** 화면에 늘어놓는 순서. 기본값(회원 載具)이 맨 위다 */
export const INVOICE_TYPES: ReadonlyArray<UserOrderInvoiceType> = [
  "MEMBER_CARRIER",
  "MOBILE_BARCODE",
  "CITIZEN_CERT",
  "DONATION",
  "COMPANY",
];

/** 서버가 소문자를 대문자로 바꾸지만, 확인 API 캐시 키가 같아지도록 프론트에서 먼저 맞춘다 */
export const toMobileBarcode = (value: string): string =>
  value.trim().toUpperCase();

export const toCitizenCert = (value: string): string =>
  value.trim().toUpperCase();

export const toDigits = (value: string): string => value.replace(/\D/g, "");

/** "/" + 7자(영문 대문자·숫자·+-.) */
export const isValidMobileBarcode = (value: string): boolean =>
  /^\/[A-Z0-9+\-.]{7}$/.test(value);

/** 영문 대문자 2 + 숫자 14 */
export const isValidCitizenCert = (value: string): boolean =>
  /^[A-Z]{2}\d{14}$/.test(value);

/** 愛心碼 숫자 3–7자리 */
export const isValidLoveCode = (value: string): boolean =>
  /^\d{3,7}$/.test(value);

/** 統一編號 8자리. 검사코드는 서버 확인 API 가 본다 */
export const isValidCompanyTaxId = (value: string): boolean =>
  /^\d{8}$/.test(value);

export const INVOICE_COMPANY_NAME_MAX = 60;

/**
 * 폼 값. API 의 `carrierNum` 은 手機條碼·自然人憑證이 공유하지만 폼에서는 칸을 따로 둔다 —
 * 한 칸을 같이 쓰면 타입을 바꿀 때 서로 덮어써 "다른 타입의 값은 지우지 않는다" 가 깨진다.
 */
export interface OrderInvoiceValues {
  type: UserOrderInvoiceType;
  mobileBarcode: string;
  citizenCert: string;
  loveCode: string;
  companyTaxId: string;
  companyName: string;
}

export const INVOICE_DEFAULT_VALUES: OrderInvoiceValues = {
  type: "MEMBER_CARRIER",
  mobileBarcode: "",
  citizenCert: "",
  loveCode: "",
  companyTaxId: "",
  companyName: "",
};

export const INVOICE_ERROR_KEY: Record<
  Exclude<keyof OrderInvoiceValues, "type">,
  string
> = {
  mobileBarcode: "invoice_mobile_barcode_invalid",
  citizenCert: "invoice_citizen_cert_invalid",
  loveCode: "invoice_love_code_invalid",
  companyTaxId: "invoice_company_tax_id_invalid",
  companyName: "invoice_company_name_too_long",
};

/** 타입별로 서버 확인 대상이 되는 폼 칸. 확인 API 가 없는 타입은 null */
export const INVOICE_CHECK_FIELD: Record<
  UserOrderInvoiceType,
  keyof OrderInvoiceValues | null
> = {
  MEMBER_CARRIER: null,
  MOBILE_BARCODE: "mobileBarcode",
  CITIZEN_CERT: null,
  DONATION: "loveCode",
  COMPANY: "companyTaxId",
};

/**
 * 현재 `type` 의 칸만 검사한다. 다른 타입에 적어 둔 값은 제출에 실리지 않으므로 틀려도 막지
 * 않는다 — 실수로 타입을 바꿨다 돌아오는 사용자의 입력을 지키려는 것이다.
 */
export const orderInvoiceSchema = z
  .object({
    type: z.enum(
      INVOICE_TYPES as [UserOrderInvoiceType, ...UserOrderInvoiceType[]],
    ),
    mobileBarcode: z.string(),
    citizenCert: z.string(),
    loveCode: z.string(),
    companyTaxId: z.string(),
    companyName: z.string(),
  })
  .superRefine((values, ctx) => {
    const fail = (path: Exclude<keyof OrderInvoiceValues, "type">) =>
      ctx.addIssue({
        code: "custom",
        path: [path],
        message: INVOICE_ERROR_KEY[path],
      });

    switch (values.type) {
      case "MOBILE_BARCODE":
        if (!isValidMobileBarcode(toMobileBarcode(values.mobileBarcode)))
          fail("mobileBarcode");
        break;
      case "CITIZEN_CERT":
        if (!isValidCitizenCert(toCitizenCert(values.citizenCert)))
          fail("citizenCert");
        break;
      case "DONATION":
        if (!isValidLoveCode(toDigits(values.loveCode))) fail("loveCode");
        break;
      case "COMPANY":
        if (!isValidCompanyTaxId(toDigits(values.companyTaxId)))
          fail("companyTaxId");
        if (values.companyName.trim().length > INVOICE_COMPANY_NAME_MAX)
          fail("companyName");
        break;
      case "MEMBER_CARRIER":
        break;
    }
  });

// 인터페이스와 스키마가 어긋나면 여기서 컴파일이 깨진다
const _schemaMatchesValues: z.infer<typeof orderInvoiceSchema> =
  INVOICE_DEFAULT_VALUES satisfies OrderInvoiceValues;
void _schemaMatchesValues;

export const orderInvoiceResolver = zodResolver(orderInvoiceSchema);

export type InvoiceServerField = "carrierNum" | "loveCode" | "companyTaxId";

/**
 * 주문 생성 400 의 `data.field` 를 폼 칸으로. `carrierNum` 은 현재 타입이 手機條碼인지
 * 自然人憑證인지에 따라 갈리고, 현재 타입과 무관한 필드면 null 이다.
 */
export const toInvoiceFormField = (
  field: InvoiceServerField,
  type: UserOrderInvoiceType,
): keyof OrderInvoiceValues | null => {
  switch (field) {
    case "carrierNum":
      if (type === "MOBILE_BARCODE") return "mobileBarcode";
      if (type === "CITIZEN_CERT") return "citizenCert";
      return null;
    case "loveCode":
      return type === "DONATION" ? "loveCode" : null;
    case "companyTaxId":
      return type === "COMPANY" ? "companyTaxId" : null;
  }
};

/**
 * 주문 생성 body 의 `invoice`. 기본값(회원 載具)은 서버 기본과 같아 아예 빼고(undefined),
 * 나머지는 정규화한 값으로 유니온 멤버를 만든다. 회사명은 비어 있으면 키를 뺀다.
 */
export const toSubmitInvoice = (
  values: OrderInvoiceValues,
): UserOrderInvoice | undefined => {
  switch (values.type) {
    case "MEMBER_CARRIER":
      return undefined;
    case "MOBILE_BARCODE":
      return {
        type: "MOBILE_BARCODE",
        carrierNum: toMobileBarcode(values.mobileBarcode),
      };
    case "CITIZEN_CERT":
      return {
        type: "CITIZEN_CERT",
        carrierNum: toCitizenCert(values.citizenCert),
      };
    case "DONATION":
      return { type: "DONATION", loveCode: toDigits(values.loveCode) };
    case "COMPANY": {
      const companyName = values.companyName.trim();

      return {
        type: "COMPANY",
        companyTaxId: toDigits(values.companyTaxId),
        ...(companyName && { companyName }),
      };
    }
  }
};
