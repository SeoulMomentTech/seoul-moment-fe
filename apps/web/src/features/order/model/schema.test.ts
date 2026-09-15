import { describe, expect, it } from "vitest";

import { findZipCode } from "@shared/lib/regions";

import {
  isValidTaiwanMobile,
  orderShippingSchema,
  toPhoneDigits,
  toPhoneInput,
  toTaiwanMobileE164,
} from "./schema";

/** 같은 번호를 쓰는 서로 다른 입력들. 어느 쪽으로 넣어도 결과가 같아야 한다 */
const SAME_NUMBER = [
  "+886 912 345 678",
  "+886912345678",
  "886912345678",
  "886-9-1234-5678",
  "0912345678",
  "0912-345-678",
  "912345678",
  // 국제전화 접두를 그대로 쓴 경우
  "00886912345678",
  // 저장해 둔 `0912...` 를 `+886` placeholder 뒤에 붙여넣은 흔한 오입력
  "+886 0912 345 678",
];

describe("isValidTaiwanMobile", () => {
  it.each(SAME_NUMBER)("%s 를 같은 번호로 본다", (input) => {
    expect(isValidTaiwanMobile(input)).toBe(true);
  });

  it("9 로 시작하지 않거나 자리수가 어긋나면 거부한다", () => {
    expect(isValidTaiwanMobile("+886 912")).toBe(false);
    expect(isValidTaiwanMobile("0212345678")).toBe(false);
    expect(isValidTaiwanMobile("09123456789")).toBe(false);
    expect(isValidTaiwanMobile("0800092000")).toBe(false);
    expect(isValidTaiwanMobile("")).toBe(false);
  });
});

describe("toTaiwanMobileE164", () => {
  it.each(SAME_NUMBER)("%s 를 +886912345678 하나로 맞춘다", (input) => {
    expect(toTaiwanMobileE164(input)).toBe("+886912345678");
  });

  // 절반만 정규화된 값에 `+886` 을 붙여 보내면 서버가 없는 번호를 받는다.
  it("유효하지 않으면 빈 문자열이다", () => {
    expect(toTaiwanMobileE164("0212345678")).toBe("");
    expect(toTaiwanMobileE164("")).toBe("");
  });
});

describe("toPhoneInput", () => {
  it("한 자씩 쳐 나가는 동안 입력이 사라지지 않는다", () => {
    // `886` 세 자리째에서 국가번호로 오인해 지워버리면 더 칠 수가 없다.
    let box = "";
    for (const ch of "886912345678") box = toPhoneInput(box + ch);

    expect(box).toBe("912345678");
  });

  it("국가번호가 붙은 채로 한 번에 들어오면 떼어낸다", () => {
    expect(toPhoneInput("+886912345678")).toBe("912345678");
    expect(toPhoneInput("00886912345678")).toBe("912345678");
  });

  it("숫자가 아닌 것은 남기지 않는다", () => {
    expect(toPhoneInput("0912-345-678")).toBe("0912345678");
    expect(toPhoneInput("+886 912 345 678 (집)")).toBe("912345678");
  });

  // 잘라내면 너무 긴 번호가 조용히 맞는 번호로 둔갑한다.
  it("너무 긴 입력을 자르지 않는다", () => {
    expect(toPhoneInput("09123456789012")).toBe("09123456789012");
    expect(isValidTaiwanMobile(toPhoneInput("09123456789012"))).toBe(false);
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
