import { describe, expect, it } from "vitest";

import { findZipCode } from "@shared/lib/regions";

import {
  isValidTaiwanMobile,
  orderShippingSchema,
  toPhoneDigits,
} from "./schema";

describe("isValidTaiwanMobile", () => {
  it("국가번호·국내 접두·구분기호를 모두 같은 번호로 본다", () => {
    expect(isValidTaiwanMobile("+886 912 345 678")).toBe(true);
    expect(isValidTaiwanMobile("886912345678")).toBe(true);
    expect(isValidTaiwanMobile("0912-345-678")).toBe(true);
    expect(isValidTaiwanMobile("912345678")).toBe(true);
  });

  it("9 로 시작하지 않거나 자리수가 어긋나면 거부한다", () => {
    expect(isValidTaiwanMobile("+886 912")).toBe(false);
    expect(isValidTaiwanMobile("0212345678")).toBe(false);
    expect(isValidTaiwanMobile("09123456789")).toBe(false);
    expect(isValidTaiwanMobile("")).toBe(false);
  });
});

describe("toPhoneDigits", () => {
  it("숫자만 남긴다", () => {
    expect(toPhoneDigits("+886 912-345-678")).toBe("886912345678");
  });
});

describe("findZipCode", () => {
  it("縣市·區 가 정해지면 우편번호가 하나로 결정된다", () => {
    expect(findZipCode("臺北市", "信義區")).toBe("110");
  });

  it("한쪽이라도 없거나 데이터에 없으면 undefined", () => {
    expect(findZipCode("臺北市", undefined)).toBeUndefined();
    expect(findZipCode(undefined, "信義區")).toBeUndefined();
    expect(findZipCode("臺北市", "없는區")).toBeUndefined();
  });
});

describe("orderShippingSchema", () => {
  const valid = {
    recipientName: "李佳蓉",
    phone: "+886 912 345 678",
    postalCode: "110",
    city: "臺北市",
    district: "信義區",
    detailAddress: "松高路 11號 5樓",
    requestMessage: "shipping_request_none" as const,
  };

  it("모든 필수 항목이 차면 통과한다", () => {
    expect(orderShippingSchema.safeParse(valid).success).toBe(true);
  });

  it("공백만 넣은 필수 항목은 통과하지 않는다", () => {
    const result = orderShippingSchema.safeParse({
      ...valid,
      detailAddress: "   ",
    });

    expect(result.success).toBe(false);
  });

  // 縣市·區 를 고르면 자동으로 채워지는 값이지만, 비면 서버에 보낼 주소가 성립하지 않는다.
  it("우편번호가 비면 통과하지 않는다", () => {
    expect(
      orderShippingSchema.safeParse({ ...valid, postalCode: "" }).success,
    ).toBe(false);
  });
});
