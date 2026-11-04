import type { ReactNode } from "react";

import { describe, expect, it, vi } from "vitest";

import type { OrderSource } from "@entities/order";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";

import { useOrderItems } from "./useOrderItems";

vi.mock("next/navigation", () => ({ useParams: () => ({ locale: "ko" }) }));

const postUserOrderPreview = vi.fn().mockResolvedValue({
  result: true,
  data: {
    brandGroups: [],
    totalProductAmount: 0,
    shippingFee: 60,
    isRemoteIsland: false,
    isShippingEstimated: true,
    freeShippingThreshold: 1150,
    amountToFreeShipping: 1150,
    totalAmount: 60,
  },
});

vi.mock("@shared/services/userOrder", () => ({
  postUserOrderPreview: (req: unknown) => postUserOrderPreview(req),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

const source: OrderSource = { type: "cart", cartItemIds: [1, 2] };

const lastRequest = () =>
  postUserOrderPreview.mock.calls[
    postUserOrderPreview.mock.calls.length - 1
  ][0];

describe("useOrderItems", () => {
  it("택배는 縣市·區 를 보낸다", async () => {
    renderHook(
      () =>
        useOrderItems({
          source,
          previewShipping: {
            shippingType: "HOME",
            city: "臺北市",
            district: "信義區",
          },
        }),
      { wrapper },
    );

    await waitFor(() => expect(postUserOrderPreview).toHaveBeenCalled());
    expect(lastRequest()).toMatchObject({ city: "臺北市", district: "信義區" });
    expect(lastRequest()).not.toHaveProperty("shippingType");
  });

  it("편의점은 매장 토큰이 있을 때만 CVS 로 보낸다", async () => {
    renderHook(
      () =>
        useOrderItems({
          source,
          previewShipping: { shippingType: "CVS", cvsStoreToken: "tok123" },
        }),
      { wrapper },
    );

    await waitFor(() =>
      expect(lastRequest()).toMatchObject({
        shippingType: "CVS",
        cvsStoreToken: "tok123",
      }),
    );
  });

  it("매장이 없는 편의점 탭은 배송 입력 없이 예상 배송비만 묻는다", async () => {
    postUserOrderPreview.mockClear();

    renderHook(
      () => useOrderItems({ source, previewShipping: { shippingType: "CVS" } }),
      { wrapper },
    );

    await waitFor(() => expect(postUserOrderPreview).toHaveBeenCalled());
    expect(lastRequest()).not.toHaveProperty("shippingType");
    expect(lastRequest()).not.toHaveProperty("cvsStoreToken");
    expect(lastRequest()).not.toHaveProperty("city");
  });
});
