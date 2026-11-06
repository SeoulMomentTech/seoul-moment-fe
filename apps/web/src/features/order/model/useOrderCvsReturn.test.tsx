import type { ReactNode } from "react";

import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { OrderSource } from "@entities/order";
import { renderHook, waitFor } from "@testing-library/react";

import { peekOrderDraft, saveOrderDraft, type OrderDraft } from "./orderDraft";
import { useOrderCvsReturn } from "./useOrderCvsReturn";

const replace = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const draft: Omit<OrderDraft, "savedAt"> = {
  sourceHref: "/order?cart=1,2",
  shippingMethod: "CVS",
  home: {
    useDefaultShipping: true,
    values: {
      recipientName: "",
      phone: "",
      postalCode: "",
      city: "",
      district: "",
      detailAddress: "",
      requestMessage: "shipping_request_none",
    },
  },
  cvs: { chain: "UNIMART", storeToken: null, recipientName: "", phone: "" },
  paymentMethod: "LINE_PAY",
};

/** 마지막으로 어댑터가 받은 URL. 토큰이 지워졌는지 여기서 본다 */
let lastSearchParams: URLSearchParams | null = null;

const render = (searchParams: string, source: OrderSource | null) =>
  renderHook(() => useOrderCvsReturn(source), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <NuqsTestingAdapter
        onUrlUpdate={(event) => {
          lastSearchParams = event.searchParams;
        }}
        searchParams={searchParams}
      >
        {children}
      </NuqsTestingAdapter>
    ),
  });

describe("useOrderCvsReturn", () => {
  beforeEach(() => {
    sessionStorage.clear();
    lastSearchParams = null;
  });

  afterEach(() => {
    replace.mockReset();
  });

  it("draft 가 있으면 토큰을 넣고 원래 주문서로 보낸다", async () => {
    saveOrderDraft(draft);

    const { result } = render("?cvsStoreToken=tok123", null);

    await waitFor(() =>
      expect(peekOrderDraft()?.cvs.storeToken).toBe("tok123"),
    );
    expect(replace).toHaveBeenCalledWith("/order?cart=1,2");
    expect(result.current.isRedirecting).toBe(true);
  });

  it("주문 대상이 이미 같으면 토큰만 URL 에서 지운다", async () => {
    saveOrderDraft(draft);

    render("?cart=1,2&cvsStoreToken=tok123", {
      type: "cart",
      cartItemIds: [1, 2],
    });

    await waitFor(() =>
      expect(lastSearchParams?.has("cvsStoreToken")).toBe(false),
    );
    expect(peekOrderDraft()?.cvs.storeToken).toBe("tok123");
    expect(replace).not.toHaveBeenCalled();
  });

  it("draft 가 없으면 토큰만 지운다", async () => {
    const { result } = render("?cvsStoreToken=tok123", null);

    await waitFor(() =>
      expect(lastSearchParams?.has("cvsStoreToken")).toBe(false),
    );
    expect(replace).not.toHaveBeenCalled();
    expect(result.current.isRedirecting).toBe(false);
  });

  it("원래 주문서로 옮겨지면 isRedirecting 이 풀린다", async () => {
    saveOrderDraft(draft);

    // 같은 라우트 안에서 쿼리만 바뀌므로 훅은 다시 마운트되지 않고 source 만 바뀐다
    const { result, rerender } = renderHook(
      ({ source }: { source: OrderSource | null }) => useOrderCvsReturn(source),
      {
        initialProps: { source: null as OrderSource | null },
        wrapper: ({ children }: { children: ReactNode }) => (
          <NuqsTestingAdapter searchParams="?cvsStoreToken=tok123">
            {children}
          </NuqsTestingAdapter>
        ),
      },
    );

    await waitFor(() => expect(result.current.isRedirecting).toBe(true));

    rerender({ source: { type: "cart", cartItemIds: [1, 2] } });

    await waitFor(() => expect(result.current.isRedirecting).toBe(false));
  });

  it("토큰을 들고 돌아온 첫 렌더부터 이동 중으로 본다", async () => {
    saveOrderDraft(draft);
    const seen: boolean[] = [];

    renderHook(
      () => {
        const result = useOrderCvsReturn(null);
        seen.push(result.isRedirecting);
        return result;
      },
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <NuqsTestingAdapter searchParams="?cvsStoreToken=tok123">
            {children}
          </NuqsTestingAdapter>
        ),
      },
    );

    await waitFor(() => expect(replace).toHaveBeenCalled());
    // 첫 프레임에 "주문할 것이 없음" 이 깜박이지 않아야 한다
    expect(seen[0]).toBe(true);
  });

  it("토큰이 없으면 아무것도 하지 않는다", () => {
    saveOrderDraft(draft);

    const { result } = render("?cart=1,2", {
      type: "cart",
      cartItemIds: [1, 2],
    });

    expect(replace).not.toHaveBeenCalled();
    expect(lastSearchParams).toBeNull();
    expect(peekOrderDraft()?.cvs.storeToken).toBeNull();
    expect(result.current.isRedirecting).toBe(false);
  });
});
