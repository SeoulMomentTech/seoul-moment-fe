import { describe, expect, it } from "vitest";

import { getLogisticsCvsMapUrl } from "./logistics";

describe("getLogisticsCvsMapUrl", () => {
  it("returnUrl 의 쿼리까지 통째로 퍼센트 인코딩해 붙인다", () => {
    const url = new URL(
      getLogisticsCvsMapUrl({
        chain: "UNIMART",
        returnUrl: "http://localhost:3000/ko/order?buy=573:1",
      }),
    );

    expect(url.pathname).toBe("/logistics/cvs/map");
    expect(url.search).toBe(
      "?chain=UNIMART&returnUrl=http%3A%2F%2Flocalhost%3A3000%2Fko%2Forder%3Fbuy%3D573%3A1",
    );
    // 서버가 디코딩하면 원래 주소가 그대로 나와야 한다
    expect(url.searchParams.get("returnUrl")).toBe(
      "http://localhost:3000/ko/order?buy=573:1",
    );
  });

  it("returnUrl 이 없으면 chain 만 보낸다", () => {
    const url = new URL(getLogisticsCvsMapUrl({ chain: "FAMI" }));

    expect(url.search).toBe("?chain=FAMI");
  });
});
