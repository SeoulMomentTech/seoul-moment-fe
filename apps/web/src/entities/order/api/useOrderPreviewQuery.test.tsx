import type { ReactNode } from "react";

import { describe, expect, it, vi } from "vitest";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { useOrderPreviewQuery } from "./useOrderPreviewQuery";
import type { OrderSource } from "../model/orderSource";

vi.mock("next/navigation", () => ({ useParams: () => ({ locale: "ko" }) }));

/** 응답을 우리가 풀 때까지 붙잡아 둔다 — 로딩 중 화면 상태를 봐야 한다 */
let resolveNext: ((fee: number) => void) | undefined;

const postUserOrderPreview = vi.fn(
  () =>
    new Promise((resolve) => {
      resolveNext = (shippingFee) =>
        resolve({
          result: true,
          data: {
            brandGroups: [
              {
                brandId: 1,
                brandName: "온도",
                brandProfileImage: "",
                items: [],
                productAmount: 900,
              },
            ],
            totalProductAmount: 900,
            shippingFee,
            isRemoteIsland: false,
            isShippingEstimated: false,
            freeShippingThreshold: 1150,
            amountToFreeShipping: 250,
            totalAmount: 900 + shippingFee,
          },
        });
    }),
);

vi.mock("@shared/services/userOrder", () => ({
  postUserOrderPreview: () => postUserOrderPreview(),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

const source: OrderSource = { type: "cart", cartItemIds: [1, 2] };

describe("useOrderPreviewQuery", () => {
  /**
   * 주문서는 라인 목록도 이 응답에서 읽는다. 주소를 고칠 때마다 쿼리 키가 바뀌는데,
   * 그때 데이터가 비면 화면 전체가 스켈레톤으로 돌아간다 — 주소를 고르는 동안 주문
   * 상품이 사라졌다 나타난다.
   */
  it("주소를 바꿔 다시 계산하는 동안에도 직전 결과를 들고 있다", async () => {
    const { result, rerender } = renderHook(
      ({ city, district }: { city?: string; district?: string }) =>
        useOrderPreviewQuery({ source, city, district }),
      { wrapper, initialProps: {} },
    );

    resolveNext?.(60);
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.shippingFee).toBe(60);

    rerender({ city: "臺北市", district: "信義區" });

    // 새 주소의 응답을 아직 안 줬다. 이 순간 화면이 그릴 게 있어야 한다.
    expect(result.current.isPending).toBe(false);
    expect(result.current.data?.shippingFee).toBe(60);
    expect(result.current.isPlaceholderData).toBe(true);

    resolveNext?.(0);
    await waitFor(() => expect(result.current.isPlaceholderData).toBe(false));
    expect(result.current.data?.shippingFee).toBe(0);
  });
});
