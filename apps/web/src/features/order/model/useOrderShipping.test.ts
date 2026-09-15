import { describe, expect, it } from "vitest";

import type { UserInfo, UserProfile } from "@shared/services/user";

import { act, renderHook, waitFor } from "@testing-library/react";

import { useOrderShipping } from "./useOrderShipping";

const profile: UserProfile = {
  nickname: "jia",
  name: "李佳蓉",
  gender: "FEMALE",
  birthDate: "1995-03-11",
  postalCode: "110",
  city: "臺北市",
  district: "信義區",
  detailAddress: "松高路 11號 5樓",
};

const userInfo: UserInfo = {
  phone: "+886912345678",
  email: "jia@example.com",
  newProductAgreed: false,
  adAgreed: false,
  recommendAgreed: false,
};

describe("useOrderShipping", () => {
  it("주소도 연락처도 없으면 결제하기를 열지 않는다", async () => {
    const { result } = renderHook(() => useOrderShipping({}));

    expect(result.current.canUseDefault).toBe(false);
    await waitFor(() => expect(result.current.isValid).toBe(false));
  });

  it("기본 배송지가 채워지면 바로 유효하다", async () => {
    const { result } = renderHook(() =>
      useOrderShipping({ profile, userInfo }),
    );

    expect(result.current.canUseDefault).toBe(true);
    await waitFor(() => expect(result.current.isValid).toBe(true));
  });

  it("연락처가 없는 프로필은 기본 배송지를 쓸 수 없고 폼도 비어 있다", async () => {
    const { result } = renderHook(() => useOrderShipping({ profile }));

    expect(result.current.canUseDefault).toBe(false);
    await waitFor(() => expect(result.current.isValid).toBe(false));
    expect(result.current.shipping.recipientName).toBe("");
  });

  it("직접 입력으로 바꾸면 값은 남지만 縣市 를 갈아끼우면 다시 잠긴다", async () => {
    const { result } = renderHook(() =>
      useOrderShipping({ profile, userInfo }),
    );

    await waitFor(() => expect(result.current.isValid).toBe(true));

    act(() => result.current.setUseDefaultShipping(false));

    // 체크를 풀어도 같은 폼 값을 그대로 이어받는다 — 다시 입력시키지 않는다.
    await waitFor(() => expect(result.current.isValid).toBe(true));
    expect(result.current.shipping.detailAddress).toBe("松高路 11號 5樓");

    // 縣市 를 바꾸면 區·우편번호가 비므로 필수 항목이 다시 빈다.
    act(() => result.current.handleCityChange("臺中市"));

    await waitFor(() => expect(result.current.isValid).toBe(false));
    expect(result.current.district).toBe("");
  });

  it("區 를 고르면 우편번호가 채워지며 다시 유효해진다", async () => {
    const { result } = renderHook(() =>
      useOrderShipping({ profile, userInfo }),
    );

    await waitFor(() => expect(result.current.isValid).toBe(true));

    act(() => result.current.setUseDefaultShipping(false));
    act(() => result.current.handleCityChange("臺中市"));
    await waitFor(() => expect(result.current.isValid).toBe(false));

    act(() => result.current.handleDistrictChange("西屯區"));

    await waitFor(() => expect(result.current.isValid).toBe(true));
    expect(result.current.shipping.postalCode).not.toBe("");
  });
});
