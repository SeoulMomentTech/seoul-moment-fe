import type { ReactNode } from "react";
import { createElement } from "react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { UserInfo, UserProfile } from "@shared/services/user";

import type { OrderSource } from "@entities/order";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

import { INVOICE_DEFAULT_VALUES } from "./invoiceSchema";
import { peekOrderDraft, saveOrderDraft, type OrderDraft } from "./orderDraft";
import { useOrderShipping } from "./useOrderShipping";

vi.mock("next/navigation", () => ({ useParams: () => ({ locale: "ko" }) }));
vi.mock("@/i18n/navigation", () => ({
  getPathname: ({ href, locale }: { href: string; locale: string }) =>
    `/${locale}${href}`,
}));

const navigateTo = vi.fn();
vi.mock("./navigate", () => ({ navigateTo: (url: string) => navigateTo(url) }));

const getLogisticsCvsStore = vi.fn();
vi.mock("@shared/services/logistics", () => ({
  getLogisticsCvsStore: (token: string) => getLogisticsCvsStore(token),
  getLogisticsCvsMapUrl: ({
    chain,
    returnUrl,
  }: {
    chain: string;
    returnUrl?: string;
  }) =>
    `https://api.test/logistics/cvs/map?chain=${chain}&returnUrl=${encodeURIComponent(returnUrl ?? "")}`,
}));

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

const source: OrderSource = { type: "cart", cartItemIds: [1, 2] };

const store = {
  storeToken: "tok123",
  chain: "UNIMART" as const,
  logisticsSubType: "UNIMARTC2C",
  storeId: "131386",
  storeName: "建盛門市",
  storeAddress: "台北市中正區重慶南路一段122號",
  storeTelephone: null,
  isOutsideIsland: false,
};

const EMPTY_HOME = {
  recipientName: "",
  phone: "",
  postalCode: "",
  city: "",
  district: "",
  detailAddress: "",
  requestMessage: "shipping_request_none",
} as const;

const cvsDraft: Omit<OrderDraft, "savedAt"> = {
  sourceHref: "/order?cart=1,2",
  shippingMethod: "CVS",
  home: { useDefaultShipping: true, values: EMPTY_HOME },
  cvs: {
    chain: "UNIMART",
    storeToken: "tok123",
    recipientName: "李佳蓉",
    phone: "0912345678",
  },
  paymentMethod: "ECPAY",
};

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    QueryClientProvider,
    {
      client: new QueryClient({
        defaultOptions: { queries: { retry: false } },
      }),
    },
    children,
  );

type Params = Parameters<typeof useOrderShipping>[0];

const render = (params: Params) =>
  renderHook((p: Params) => useOrderShipping(p), {
    initialProps: params,
    wrapper,
  });

describe("useOrderShipping", () => {
  beforeEach(() => {
    sessionStorage.clear();
    getLogisticsCvsStore.mockResolvedValue({ result: true, data: store });
  });

  afterEach(() => {
    navigateTo.mockReset();
    getLogisticsCvsStore.mockReset();
    vi.restoreAllMocks();
  });

  describe("택배", () => {
    it("주소도 연락처도 없으면 결제하기를 열지 않는다", async () => {
      const { result } = render({ source });

      expect(result.current.canUseDefault).toBe(false);
      await waitFor(() => expect(result.current.isValid).toBe(false));
      expect(result.current.submitShipping).toBeNull();
    });

    it("기본 배송지가 채워지면 바로 유효하고 제출값은 기본 배송지다", async () => {
      const { result } = render({ source, profile, userInfo });

      expect(result.current.canUseDefault).toBe(true);
      await waitFor(() => expect(result.current.isValid).toBe(true));
      expect(result.current.submitShipping).toEqual({
        shippingType: "HOME",
        useDefaultShipping: true,
      });
      expect(result.current.previewShipping).toEqual({
        shippingType: "HOME",
        city: "臺北市",
        district: "信義區",
      });
    });

    it("연락처가 없는 프로필은 기본 배송지를 쓸 수 없고 폼도 비어 있다", async () => {
      const { result } = render({ source, profile });

      expect(result.current.canUseDefault).toBe(false);
      await waitFor(() => expect(result.current.isValid).toBe(false));
      expect(result.current.shipping.recipientName).toBe("");
    });

    it("직접 입력으로 바꾸면 값은 남지만 縣市 를 갈아끼우면 다시 잠긴다", async () => {
      const { result } = render({ source, profile, userInfo });

      await waitFor(() => expect(result.current.isValid).toBe(true));

      act(() => result.current.setUseDefaultShipping(false));

      await waitFor(() => expect(result.current.isValid).toBe(true));
      expect(result.current.shipping.detailAddress).toBe("松高路 11號 5樓");
      expect(result.current.submitShipping).toMatchObject({
        shippingType: "HOME",
        useDefaultShipping: false,
        shipping: { detailAddress: "松高路 11號 5樓" },
      });

      act(() => result.current.handleCityChange("臺中市"));

      await waitFor(() => expect(result.current.isValid).toBe(false));
      expect(result.current.district).toBe("");
    });

    it("區 를 고르면 우편번호가 채워지며 다시 유효해진다", async () => {
      const { result } = render({ source, profile, userInfo });

      await waitFor(() => expect(result.current.isValid).toBe(true));

      act(() => result.current.setUseDefaultShipping(false));
      act(() => result.current.handleCityChange("臺中市"));
      await waitFor(() => expect(result.current.isValid).toBe(false));

      act(() => result.current.handleDistrictChange("西屯區"));

      await waitFor(() => expect(result.current.isValid).toBe(true));
      expect(result.current.shipping.postalCode).not.toBe("");
    });
  });

  describe("편의점 픽업", () => {
    it("기본은 택배이고 편의점 폼은 프로필 이름과 09 번호로 채워진다", async () => {
      const { result } = render({ source, profile, userInfo });

      expect(result.current.shippingMethod).toBe("HOME");
      await waitFor(() =>
        expect(result.current.cvs.form.getValues()).toEqual({
          recipientName: "李佳蓉",
          phone: "0912345678",
        }),
      );
    });

    it("편의점 탭은 매장이 없으면 유효하지 않고 미리보기에 토큰을 넣지 않는다", async () => {
      const { result } = render({ source, profile, userInfo });

      act(() => result.current.setShippingMethod("CVS"));

      expect(result.current.previewShipping).toEqual({ shippingType: "CVS" });
      await waitFor(() => expect(result.current.isValid).toBe(false));
      expect(result.current.submitShipping).toBeNull();
    });

    it("칩을 누르면 draft 를 저장하고 주문 대상 쿼리가 붙은 복귀 주소로 지도에 간다", () => {
      const { result } = render({ source, profile, userInfo });

      act(() => result.current.setShippingMethod("CVS"));
      act(() => result.current.cvs.openCvsMap("FAMI"));

      expect(peekOrderDraft()).toMatchObject({
        sourceHref: "/order?cart=1,2",
        shippingMethod: "CVS",
        cvs: { chain: "FAMI" },
        paymentMethod: "LINE_PAY",
      });
      expect(navigateTo).toHaveBeenCalledWith(
        expect.stringContaining(
          `returnUrl=${encodeURIComponent(`${window.location.origin}/ko/order?cart=1,2`)}`,
        ),
      );
      expect(navigateTo).toHaveBeenCalledWith(
        expect.stringContaining("chain=FAMI"),
      );
    });

    it("저장이 실패해도 지도로 이동한다", () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceeded");
      });
      const { result } = render({ source, profile, userInfo });

      act(() => result.current.cvs.openCvsMap("HILIFE"));

      expect(navigateTo).toHaveBeenCalledTimes(1);
    });

    it("같은 체인 칩을 다시 누르면 지도로 가지 않는다", async () => {
      saveOrderDraft(cvsDraft);
      const { result } = render({ source, profile, userInfo });

      await waitFor(() => expect(result.current.cvs.store).toEqual(store));

      act(() => result.current.cvs.openCvsMap("UNIMART"));

      expect(navigateTo).not.toHaveBeenCalled();

      act(() => result.current.cvs.openCvsMap("FAMI"));

      expect(navigateTo).toHaveBeenCalledTimes(1);
    });

    it("매장이 있어도 다시 고르기는 draft 를 저장하고 같은 체인 지도로 간다", async () => {
      saveOrderDraft(cvsDraft);
      const { result } = render({ source, profile, userInfo });

      await waitFor(() => expect(result.current.cvs.store).toEqual(store));

      act(() => result.current.cvs.reselectStore());

      expect(peekOrderDraft()).toMatchObject({ cvs: { chain: "UNIMART" } });
      expect(navigateTo).toHaveBeenCalledWith(
        expect.stringContaining("chain=UNIMART"),
      );
    });

    it("매장 조회가 404 가 아닌 오류면 에러로 표시하고 토큰은 지키며 다시 시도할 수 있다", async () => {
      getLogisticsCvsStore.mockRejectedValueOnce(
        Object.assign(new Error("500"), { response: { status: 500 } }),
      );
      saveOrderDraft(cvsDraft);

      const { result } = render({ source, profile, userInfo });

      await waitFor(() => expect(result.current.cvs.isStoreError).toBe(true));
      expect(result.current.cvs.isStoreExpired).toBe(false);
      expect(result.current.cvs.storeToken).toBe("tok123");
      expect(result.current.isValid).toBe(false);

      act(() => result.current.cvs.retryStore());

      await waitFor(() => expect(result.current.cvs.store).toEqual(store));
      expect(result.current.cvs.isStoreError).toBe(false);
    });

    it("draft 를 복원하면 매장 조회 성공 뒤에야 미리보기에 토큰이 들어가고 제출값이 생긴다", async () => {
      let resolveStore: (() => void) | undefined;
      getLogisticsCvsStore.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveStore = () => resolve({ result: true, data: store });
          }),
      );
      saveOrderDraft(cvsDraft);

      const { result } = render({ source, profile, userInfo });

      expect(peekOrderDraft()).toBeNull();
      await waitFor(() => expect(result.current.shippingMethod).toBe("CVS"));
      expect(result.current.paymentMethod).toBe("ECPAY");
      expect(result.current.cvs.chain).toBe("UNIMART");
      expect(result.current.cvs.storeToken).toBe("tok123");
      expect(result.current.cvs.isStoreLoading).toBe(true);
      expect(result.current.previewShipping).toEqual({ shippingType: "CVS" });
      expect(result.current.isValid).toBe(false);

      await waitFor(() => expect(resolveStore).toBeDefined());
      act(() => resolveStore?.());

      await waitFor(() =>
        expect(result.current.previewShipping).toEqual({
          shippingType: "CVS",
          cvsStoreToken: "tok123",
        }),
      );
      expect(result.current.isValid).toBe(true);
      expect(result.current.submitShipping).toEqual({
        shippingType: "CVS",
        cvsPickup: {
          storeToken: "tok123",
          recipientName: "李佳蓉",
          phone: "0912345678",
        },
      });
    });

    it("매장 조회가 404 면 만료로 표시하고 토큰을 비운다", async () => {
      getLogisticsCvsStore.mockRejectedValue(
        Object.assign(new Error("404"), { response: { status: 404 } }),
      );
      saveOrderDraft(cvsDraft);

      const { result } = render({ source, profile, userInfo });

      await waitFor(() => expect(result.current.cvs.isStoreExpired).toBe(true));
      expect(result.current.cvs.storeToken).toBeNull();
      expect(result.current.cvs.store).toBeUndefined();
      expect(result.current.isValid).toBe(false);

      // 다시 고르러 가면 만료 표시는 걷힌다
      act(() => result.current.cvs.openCvsMap("UNIMART"));
      expect(result.current.cvs.isStoreExpired).toBe(false);
    });

    it("택배 탭으로 돌아오면 미리보기와 유효성이 택배 기준이다", async () => {
      saveOrderDraft({
        ...cvsDraft,
        home: {
          useDefaultShipping: true,
          values: {
            ...EMPTY_HOME,
            recipientName: "李佳蓉",
            phone: "912345678",
            postalCode: "110",
            city: "臺北市",
            district: "信義區",
            detailAddress: "松高路 11號 5樓",
          },
        },
      });
      const { result } = render({ source, profile, userInfo });

      await waitFor(() => expect(result.current.cvs.store).toEqual(store));
      await waitFor(() => expect(result.current.isValid).toBe(true));

      act(() => result.current.setShippingMethod("HOME"));

      expect(result.current.previewShipping).toEqual({
        shippingType: "HOME",
        city: "臺北市",
        district: "信義區",
      });
      await waitFor(() => expect(result.current.isValid).toBe(true));
      expect(result.current.submitShipping).toEqual({
        shippingType: "HOME",
        useDefaultShipping: true,
      });
      // 편의점 쪽 값은 버리지 않는다
      expect(result.current.cvs.store).toEqual(store);
    });

    it("복원된 직접 입력 주소를 늦게 온 프로필이 덮지 않는다", async () => {
      saveOrderDraft({
        ...cvsDraft,
        shippingMethod: "HOME",
        home: {
          useDefaultShipping: false,
          values: {
            ...EMPTY_HOME,
            recipientName: "陳小明",
            phone: "912000000",
            postalCode: "407",
            city: "臺中市",
            district: "西屯區",
            detailAddress: "X",
          },
        },
      });
      const { result, rerender } = render({ source });

      await waitFor(() =>
        expect(result.current.shipping.recipientName).toBe("陳小明"),
      );

      rerender({ source, profile, userInfo });

      await waitFor(() => expect(result.current.canUseDefault).toBe(true));
      expect(result.current.useDefaultShipping).toBe(false);
      expect(result.current.shipping.recipientName).toBe("陳小明");
    });

    it("프로필이 이미 있어도 복원된 직접 입력 주소를 덮지 않는다", async () => {
      saveOrderDraft({
        ...cvsDraft,
        shippingMethod: "HOME",
        home: {
          useDefaultShipping: false,
          values: { ...EMPTY_HOME, recipientName: "陳小明", city: "臺中市" },
        },
      });
      const { result } = render({ source, profile, userInfo });

      await waitFor(() =>
        expect(result.current.shipping.recipientName).toBe("陳小明"),
      );
      expect(result.current.useDefaultShipping).toBe(false);

      // 기본 배송지를 다시 켜면 그때는 프로필로 채운다
      act(() => result.current.setUseDefaultShipping(true));
      await waitFor(() =>
        expect(result.current.shipping.recipientName).toBe("李佳蓉"),
      );
    });
  });

  describe("전자발표 draft 연결", () => {
    const invoiceValues = {
      ...INVOICE_DEFAULT_VALUES,
      type: "DONATION" as const,
      loveCode: "168001",
    };

    it("지도로 떠날 때 invoice draft 를 같이 저장한다", () => {
      const { result } = render({
        source,
        profile,
        userInfo,
        invoice: { getDraft: () => invoiceValues, restoreDraft: vi.fn() },
      });

      act(() => result.current.cvs.openCvsMap("FAMI"));

      expect(peekOrderDraft()?.invoice).toEqual(invoiceValues);
    });

    it("돌아와서 복원할 때 invoice 를 restoreDraft 로 넘긴다", async () => {
      saveOrderDraft({ ...cvsDraft, invoice: invoiceValues });
      const restoreDraft = vi.fn();

      render({
        source,
        profile,
        userInfo,
        invoice: { getDraft: () => INVOICE_DEFAULT_VALUES, restoreDraft },
      });

      await waitFor(() =>
        expect(restoreDraft).toHaveBeenCalledWith(invoiceValues),
      );
    });
  });
});
