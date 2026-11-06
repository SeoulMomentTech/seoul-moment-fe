import type { ReactNode } from "react";

import { afterEach, describe, expect, it, vi } from "vitest";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";

import { INVOICE_DEFAULT_VALUES } from "./invoiceSchema";
import { useOrderInvoice } from "./useOrderInvoice";

const mobileCheck = vi.fn();
const loveCheck = vi.fn();
const companyCheck = vi.fn();

vi.mock("@shared/services/userInvoice", () => ({
  getUserInvoiceMobileBarcodeCheck: (code: string) => mobileCheck(code),
  getUserInvoiceLoveCodeCheck: (code: string) => loveCheck(code),
  getUserInvoiceCompanyCheck: (taxId: string) => companyCheck(taxId),
}));

const ok = (data: object) => ({ result: true, data });

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

const render = () => renderHook(() => useOrderInvoice(), { wrapper });

describe("useOrderInvoice", () => {
  afterEach(() => {
    mobileCheck.mockReset();
    loveCheck.mockReset();
    companyCheck.mockReset();
  });

  it("기본값은 MEMBER_CARRIER 이고 유효하며 제출값이 없다", () => {
    const { result } = render();

    expect(result.current.type).toBe("MEMBER_CARRIER");
    expect(result.current.isValid).toBe(true);
    expect(result.current.submitInvoice).toBeUndefined();
    expect(result.current.check.status).toBe("idle");
    expect(mobileCheck).not.toHaveBeenCalled();
  });

  it("手機條碼는 입력만으로는 확인 API 가 나가지 않는다", () => {
    const { result } = render();

    act(() => result.current.setType("MOBILE_BARCODE"));
    act(() => result.current.form.setValue("mobileBarcode", "/ABC1234"));

    expect(mobileCheck).not.toHaveBeenCalled();
    expect(result.current.isValid).toBe(false);
  });

  it("blur 하면 정규화한 값으로 한 번 부르고, 확인되면 유효하다", async () => {
    mobileCheck.mockResolvedValue(ok({ valid: true, verified: true }));
    const { result } = render();

    act(() => result.current.setType("MOBILE_BARCODE"));
    act(() => result.current.form.setValue("mobileBarcode", " /abc1234 "));
    act(() => result.current.confirmField());

    await waitFor(() => expect(result.current.check.status).toBe("valid"));
    expect(mobileCheck).toHaveBeenCalledTimes(1);
    expect(mobileCheck).toHaveBeenCalledWith("/ABC1234");
    expect(result.current.isValid).toBe(true);
    expect(result.current.submitInvoice).toEqual({
      type: "MOBILE_BARCODE",
      carrierNum: "/ABC1234",
    });
  });

  it("형식이 틀리면 blur 해도 부르지 않는다", () => {
    const { result } = render();

    act(() => result.current.setType("MOBILE_BARCODE"));
    act(() => result.current.form.setValue("mobileBarcode", "ABC"));
    act(() => result.current.confirmField());

    expect(mobileCheck).not.toHaveBeenCalled();
    expect(result.current.check.status).toBe("idle");
    expect(result.current.isValid).toBe(false);
  });

  it("valid:false 면 invalid 이고 결제가 막힌다", async () => {
    mobileCheck.mockResolvedValue(ok({ valid: false, verified: true }));
    const { result } = render();

    act(() => result.current.setType("MOBILE_BARCODE"));
    act(() => result.current.form.setValue("mobileBarcode", "/ABC1234"));
    act(() => result.current.confirmField());

    await waitFor(() => expect(result.current.check.status).toBe("invalid"));
    expect(result.current.isValid).toBe(false);
  });

  it("verified:false 면 unverified 이고 결제는 된다", async () => {
    mobileCheck.mockResolvedValue(ok({ valid: true, verified: false }));
    const { result } = render();

    act(() => result.current.setType("MOBILE_BARCODE"));
    act(() => result.current.form.setValue("mobileBarcode", "/ABC1234"));
    act(() => result.current.confirmField());

    await waitFor(() => expect(result.current.check.status).toBe("unverified"));
    expect(result.current.isValid).toBe(true);
  });

  it("확인 API 가 실패해도 unverified 이고 결제는 된다", async () => {
    mobileCheck.mockRejectedValue(new Error("500"));
    const { result } = render();

    act(() => result.current.setType("MOBILE_BARCODE"));
    act(() => result.current.form.setValue("mobileBarcode", "/ABC1234"));
    act(() => result.current.confirmField());

    await waitFor(() => expect(result.current.check.status).toBe("unverified"));
    expect(result.current.isValid).toBe(true);
  });

  it("같은 값을 다시 blur 해도 재호출하지 않는다", async () => {
    mobileCheck.mockResolvedValue(ok({ valid: true, verified: true }));
    const { result } = render();

    act(() => result.current.setType("MOBILE_BARCODE"));
    act(() => result.current.form.setValue("mobileBarcode", "/ABC1234"));
    act(() => result.current.confirmField());
    await waitFor(() => expect(result.current.check.status).toBe("valid"));
    act(() => result.current.confirmField());

    await waitFor(() => expect(result.current.check.status).toBe("valid"));
    expect(mobileCheck).toHaveBeenCalledTimes(1);
  });

  it("愛心碼가 확인되면 기부처 이름이 온다", async () => {
    loveCheck.mockResolvedValue(
      ok({
        valid: true,
        verified: true,
        name: "財團法人台灣兒童暨家庭扶助基金會",
      }),
    );
    const { result } = render();

    act(() => result.current.setType("DONATION"));
    act(() => result.current.form.setValue("loveCode", "168001"));
    act(() => result.current.confirmField());

    await waitFor(() => expect(result.current.check.status).toBe("valid"));
    expect(result.current.check.name).toBe("財團法人台灣兒童暨家庭扶助基金會");
    expect(loveCheck).toHaveBeenCalledWith("168001");
  });

  it("타입을 바꿨다 돌아와도 값과 확인 결과가 남는다", async () => {
    loveCheck.mockResolvedValue(ok({ valid: true, verified: true, name: "x" }));
    const { result } = render();

    act(() => result.current.setType("DONATION"));
    act(() => result.current.form.setValue("loveCode", "168001"));
    act(() => result.current.confirmField());
    await waitFor(() => expect(result.current.check.status).toBe("valid"));

    act(() => result.current.setType("COMPANY"));
    expect(result.current.check.status).toBe("idle");
    act(() => result.current.setType("DONATION"));

    expect(result.current.form.getValues("loveCode")).toBe("168001");
    await waitFor(() => expect(result.current.check.status).toBe("valid"));
    expect(loveCheck).toHaveBeenCalledTimes(1);
  });

  it("統一編號가 확인되면 비어 있는 회사명을 채운다", async () => {
    companyCheck.mockResolvedValue(
      ok({ valid: true, verified: true, name: "首爾映像有限公司" }),
    );
    const { result } = render();

    act(() => result.current.setType("COMPANY"));
    act(() => result.current.form.setValue("companyTaxId", "97025978"));
    act(() => result.current.confirmField());

    await waitFor(() =>
      expect(result.current.form.getValues("companyName")).toBe(
        "首爾映像有限公司",
      ),
    );
    expect(result.current.submitInvoice).toEqual({
      type: "COMPANY",
      companyTaxId: "97025978",
      companyName: "首爾映像有限公司",
    });
  });

  it("회사명을 이미 적었으면 덮지 않는다", async () => {
    companyCheck.mockResolvedValue(
      ok({ valid: true, verified: true, name: "首爾映像有限公司" }),
    );
    const { result } = render();

    act(() => result.current.setType("COMPANY"));
    act(() => result.current.form.setValue("companyName", "내 회사"));
    act(() => result.current.form.setValue("companyTaxId", "97025978"));
    act(() => result.current.confirmField());

    await waitFor(() => expect(result.current.check.status).toBe("valid"));
    expect(result.current.form.getValues("companyName")).toBe("내 회사");
  });

  it("applyServerFieldError 는 현재 타입의 칸에 에러를 건다", () => {
    const { result } = render();

    act(() => result.current.setType("MOBILE_BARCODE"));
    act(() => result.current.applyServerFieldError("carrierNum"));

    expect(result.current.form.formState.errors.mobileBarcode?.message).toBe(
      "invoice_check_not_found",
    );
  });

  it("서버가 거절한 값은 확인 결과가 캐시돼 있어도 isValid 가 false 다", async () => {
    mobileCheck.mockResolvedValue(ok({ valid: true, verified: true }));
    const { result } = render();

    act(() => result.current.setType("MOBILE_BARCODE"));
    act(() => result.current.form.setValue("mobileBarcode", "/ABC1234"));
    act(() => result.current.confirmField());
    await waitFor(() => expect(result.current.isValid).toBe(true));

    act(() => result.current.applyServerFieldError("carrierNum"));

    expect(result.current.isValid).toBe(false);
    expect(result.current.submitInvoice).toBeUndefined();
  });

  it("ensureChecked 는 blur 없이도 확인을 한 번 부르고 결과를 준다", async () => {
    mobileCheck.mockResolvedValue(ok({ valid: true, verified: true }));
    const { result } = render();

    act(() => result.current.setType("MOBILE_BARCODE"));
    act(() => result.current.form.setValue("mobileBarcode", "/abc1234"));

    await expect(result.current.ensureChecked()).resolves.toEqual({
      ok: true,
      invoice: { type: "MOBILE_BARCODE", carrierNum: "/ABC1234" },
    });
    expect(mobileCheck).toHaveBeenCalledTimes(1);
    expect(mobileCheck).toHaveBeenCalledWith("/ABC1234");
    await waitFor(() => expect(result.current.check.status).toBe("valid"));
  });

  it("ensureChecked 는 valid:false 면 ok:false", async () => {
    mobileCheck.mockResolvedValue(ok({ valid: false, verified: true }));
    const { result } = render();

    act(() => result.current.setType("MOBILE_BARCODE"));
    act(() => result.current.form.setValue("mobileBarcode", "/ABC1234"));

    await expect(result.current.ensureChecked()).resolves.toEqual({
      ok: false,
    });
  });

  it("ensureChecked 는 API 실패면 ok:true", async () => {
    mobileCheck.mockRejectedValue(new Error("500"));
    const { result } = render();

    act(() => result.current.setType("MOBILE_BARCODE"));
    act(() => result.current.form.setValue("mobileBarcode", "/ABC1234"));

    await expect(result.current.ensureChecked()).resolves.toEqual({
      ok: true,
      invoice: { type: "MOBILE_BARCODE", carrierNum: "/ABC1234" },
    });
  });

  it("ensureChecked 는 형식이 틀리면 호출 없이 ok:false", async () => {
    const { result } = render();

    act(() => result.current.setType("MOBILE_BARCODE"));
    act(() => result.current.form.setValue("mobileBarcode", "ABC"));

    await expect(result.current.ensureChecked()).resolves.toEqual({
      ok: false,
    });
    expect(mobileCheck).not.toHaveBeenCalled();
  });

  it("ensureChecked 는 MEMBER_CARRIER 면 호출 없이 invoice undefined", async () => {
    const { result } = render();

    await expect(result.current.ensureChecked()).resolves.toEqual({
      ok: true,
      invoice: undefined,
    });
    expect(mobileCheck).not.toHaveBeenCalled();
  });

  it("isSubmittable 은 형식만 맞으면 blur 전에도 true, invalid 면 false", async () => {
    mobileCheck.mockResolvedValue(ok({ valid: false, verified: true }));
    const { result } = render();

    act(() => result.current.setType("MOBILE_BARCODE"));
    act(() => result.current.form.setValue("mobileBarcode", "/ABC1234"));
    expect(result.current.isSubmittable).toBe(true);
    expect(result.current.isValid).toBe(false);

    act(() => result.current.confirmField());
    await waitFor(() => expect(result.current.check.status).toBe("invalid"));
    expect(result.current.isSubmittable).toBe(false);
  });

  it("restoreDraft 는 값을 복원하고 확인을 한 번 부른다", async () => {
    loveCheck.mockResolvedValue(ok({ valid: true, verified: true, name: "x" }));
    const { result } = render();

    act(() =>
      result.current.restoreDraft({
        ...INVOICE_DEFAULT_VALUES,
        type: "DONATION",
        loveCode: "168001",
      }),
    );

    expect(result.current.type).toBe("DONATION");
    await waitFor(() => expect(result.current.check.status).toBe("valid"));
    expect(loveCheck).toHaveBeenCalledTimes(1);
    expect(result.current.isValid).toBe(true);
  });

  it("restoreDraft 에 undefined 를 주면 기본값 그대로다", () => {
    const { result } = render();

    act(() => result.current.restoreDraft(undefined));

    expect(result.current.type).toBe("MEMBER_CARRIER");
    expect(result.current.getDraft()).toEqual(INVOICE_DEFAULT_VALUES);
  });
});
