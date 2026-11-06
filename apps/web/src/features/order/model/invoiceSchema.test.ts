import { describe, expect, it } from "vitest";

import {
  INVOICE_DEFAULT_VALUES,
  INVOICE_TYPES,
  isValidCitizenCert,
  isValidCompanyTaxId,
  isValidLoveCode,
  isValidMobileBarcode,
  orderInvoiceSchema,
  toCitizenCert,
  toDigits,
  toInvoiceFormField,
  toMobileBarcode,
  toSubmitInvoice,
} from "./invoiceSchema";

describe("정규화", () => {
  it("手機條碼는 trim 하고 대문자로 바꾼다", () => {
    expect(toMobileBarcode(" /abc1234 ")).toBe("/ABC1234");
  });

  it("自然人憑證도 같다", () => {
    expect(toCitizenCert("ab12345678901234")).toBe("AB12345678901234");
  });

  it("숫자만 남긴다", () => {
    expect(toDigits("16-8001")).toBe("168001");
  });
});

describe("형식", () => {
  it.each(["/ABC1234", "/A1+-.B2"])("手機條碼 %s 통과", (value) => {
    expect(isValidMobileBarcode(value)).toBe(true);
  });

  it.each(["ABC1234", "/abc1234", "/ABC12345", "/ABC 123"])(
    "手機條碼 %s 거절",
    (value) => {
      expect(isValidMobileBarcode(value)).toBe(false);
    },
  );

  it("自然人憑證 AB12345678901234 통과", () => {
    expect(isValidCitizenCert("AB12345678901234")).toBe(true);
  });

  it.each(["A123456789012345", "AB1234567890123", "ab12345678901234"])(
    "自然人憑證 %s 거절",
    (value) => {
      expect(isValidCitizenCert(value)).toBe(false);
    },
  );

  it.each(["168", "1680011"])("愛心碼 %s 통과", (value) => {
    expect(isValidLoveCode(value)).toBe(true);
  });

  it.each(["16", "16800112", "16a"])("愛心碼 %s 거절", (value) => {
    expect(isValidLoveCode(value)).toBe(false);
  });

  it("統一編號 97025978 통과", () => {
    expect(isValidCompanyTaxId("97025978")).toBe(true);
  });

  it.each(["9702597", "970259781", "9702597A"])("統一編號 %s 거절", (value) => {
    expect(isValidCompanyTaxId(value)).toBe(false);
  });
});

describe("orderInvoiceSchema", () => {
  it("타입 5종을 이 순서로 둔다", () => {
    expect(INVOICE_TYPES).toEqual([
      "MEMBER_CARRIER",
      "MOBILE_BARCODE",
      "CITIZEN_CERT",
      "DONATION",
      "COMPANY",
    ]);
  });

  it("MEMBER_CARRIER 는 다른 칸이 비어도 통과한다", () => {
    expect(orderInvoiceSchema.safeParse(INVOICE_DEFAULT_VALUES).success).toBe(
      true,
    );
  });

  it("MOBILE_BARCODE 는 mobileBarcode 만 본다 — 다른 칸의 쓰레기값은 무시", () => {
    const result = orderInvoiceSchema.safeParse({
      ...INVOICE_DEFAULT_VALUES,
      type: "MOBILE_BARCODE",
      mobileBarcode: "/ABC1234",
      loveCode: "x",
    });

    expect(result.success).toBe(true);
  });

  it("MOBILE_BARCODE 에 형식이 틀리면 mobileBarcode 에 에러", () => {
    const result = orderInvoiceSchema.safeParse({
      ...INVOICE_DEFAULT_VALUES,
      type: "MOBILE_BARCODE",
      mobileBarcode: "ABC",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["mobileBarcode"]);
    expect(result.error?.issues[0]?.message).toBe(
      "invoice_mobile_barcode_invalid",
    );
  });

  it("MOBILE_BARCODE 는 정규화 뒤 형식을 본다 — 소문자·공백도 통과", () => {
    const result = orderInvoiceSchema.safeParse({
      ...INVOICE_DEFAULT_VALUES,
      type: "MOBILE_BARCODE",
      mobileBarcode: " /abc1234 ",
    });

    expect(result.success).toBe(true);
  });

  it("CITIZEN_CERT 는 citizenCert 를 본다", () => {
    const result = orderInvoiceSchema.safeParse({
      ...INVOICE_DEFAULT_VALUES,
      type: "CITIZEN_CERT",
      citizenCert: "AB1234",
    });

    expect(result.error?.issues[0]?.path).toEqual(["citizenCert"]);
    expect(result.error?.issues[0]?.message).toBe(
      "invoice_citizen_cert_invalid",
    );
  });

  it("DONATION 은 loveCode 를 본다", () => {
    const result = orderInvoiceSchema.safeParse({
      ...INVOICE_DEFAULT_VALUES,
      type: "DONATION",
      loveCode: "16",
    });

    expect(result.error?.issues[0]?.path).toEqual(["loveCode"]);
    expect(result.error?.issues[0]?.message).toBe("invoice_love_code_invalid");
  });

  it("COMPANY 는 統一編號 필수, 회사명은 선택이되 60자 초과면 에러", () => {
    expect(
      orderInvoiceSchema.safeParse({
        ...INVOICE_DEFAULT_VALUES,
        type: "COMPANY",
        companyTaxId: "97025978",
      }).success,
    ).toBe(true);

    const missingTaxId = orderInvoiceSchema.safeParse({
      ...INVOICE_DEFAULT_VALUES,
      type: "COMPANY",
    });
    expect(missingTaxId.error?.issues[0]?.path).toEqual(["companyTaxId"]);

    const tooLong = orderInvoiceSchema.safeParse({
      ...INVOICE_DEFAULT_VALUES,
      type: "COMPANY",
      companyTaxId: "97025978",
      companyName: "a".repeat(61),
    });
    expect(tooLong.error?.issues[0]?.path).toEqual(["companyName"]);
    expect(tooLong.error?.issues[0]?.message).toBe(
      "invoice_company_name_too_long",
    );
  });
});

describe("toSubmitInvoice", () => {
  it("MEMBER_CARRIER 는 undefined", () => {
    expect(toSubmitInvoice(INVOICE_DEFAULT_VALUES)).toBeUndefined();
  });

  it("MOBILE_BARCODE 는 정규화한 carrierNum", () => {
    expect(
      toSubmitInvoice({
        ...INVOICE_DEFAULT_VALUES,
        type: "MOBILE_BARCODE",
        mobileBarcode: " /abc1234",
      }),
    ).toEqual({ type: "MOBILE_BARCODE", carrierNum: "/ABC1234" });
  });

  it("CITIZEN_CERT 는 citizenCert 를 carrierNum 으로", () => {
    expect(
      toSubmitInvoice({
        ...INVOICE_DEFAULT_VALUES,
        type: "CITIZEN_CERT",
        citizenCert: "ab12345678901234",
      }),
    ).toEqual({ type: "CITIZEN_CERT", carrierNum: "AB12345678901234" });
  });

  it("DONATION 은 loveCode", () => {
    expect(
      toSubmitInvoice({
        ...INVOICE_DEFAULT_VALUES,
        type: "DONATION",
        loveCode: "168001",
      }),
    ).toEqual({ type: "DONATION", loveCode: "168001" });
  });

  it("COMPANY 는 회사명이 비면 키를 뺀다", () => {
    expect(
      toSubmitInvoice({
        ...INVOICE_DEFAULT_VALUES,
        type: "COMPANY",
        companyTaxId: "97025978",
        companyName: "  ",
      }),
    ).toEqual({ type: "COMPANY", companyTaxId: "97025978" });
  });

  it("COMPANY 는 회사명을 trim 해서 보낸다", () => {
    expect(
      toSubmitInvoice({
        ...INVOICE_DEFAULT_VALUES,
        type: "COMPANY",
        companyTaxId: "97025978",
        companyName: " 首爾映像有限公司 ",
      }),
    ).toEqual({
      type: "COMPANY",
      companyTaxId: "97025978",
      companyName: "首爾映像有限公司",
    });
  });
});

describe("toInvoiceFormField", () => {
  it("carrierNum 은 type 에 따라 갈린다", () => {
    expect(toInvoiceFormField("carrierNum", "MOBILE_BARCODE")).toBe(
      "mobileBarcode",
    );
    expect(toInvoiceFormField("carrierNum", "CITIZEN_CERT")).toBe(
      "citizenCert",
    );
    expect(toInvoiceFormField("carrierNum", "DONATION")).toBeNull();
  });

  it("loveCode·companyTaxId 는 그대로", () => {
    expect(toInvoiceFormField("loveCode", "DONATION")).toBe("loveCode");
    expect(toInvoiceFormField("companyTaxId", "COMPANY")).toBe("companyTaxId");
    expect(toInvoiceFormField("loveCode", "COMPANY")).toBeNull();
  });
});
