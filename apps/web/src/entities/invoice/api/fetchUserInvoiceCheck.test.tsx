import { afterEach, describe, expect, it, vi } from "vitest";

import { QueryClient } from "@tanstack/react-query";

import { fetchUserInvoiceCheck } from "./fetchUserInvoiceCheck";
import { userInvoiceQueryKeys } from "./queryKey";

const mobileCheck = vi.fn();
const loveCheck = vi.fn();
const companyCheck = vi.fn();

vi.mock("@shared/services/userInvoice", () => ({
  getUserInvoiceMobileBarcodeCheck: (code: string) => mobileCheck(code),
  getUserInvoiceLoveCodeCheck: (code: string) => loveCheck(code),
  getUserInvoiceCompanyCheck: (taxId: string) => companyCheck(taxId),
}));

describe("fetchUserInvoiceCheck", () => {
  afterEach(() => {
    mobileCheck.mockReset();
    loveCheck.mockReset();
    companyCheck.mockReset();
  });

  it("타입별 서비스로 부르고 data 만 돌려준다", async () => {
    loveCheck.mockResolvedValue({
      result: true,
      data: { valid: true, verified: true, name: "x" },
    });
    const client = new QueryClient();

    await expect(
      fetchUserInvoiceCheck(client, "DONATION", "168001"),
    ).resolves.toEqual({ valid: true, verified: true, name: "x" });
    expect(loveCheck).toHaveBeenCalledWith("168001");
  });

  it("훅과 같은 쿼리 키에 캐시한다", async () => {
    mobileCheck.mockResolvedValue({
      result: true,
      data: { valid: true, verified: true },
    });
    const client = new QueryClient();

    await fetchUserInvoiceCheck(client, "MOBILE_BARCODE", "/ABC1234");

    expect(
      client.getQueryData(userInvoiceQueryKeys.mobileBarcodeCheck("/ABC1234")),
    ).toBeDefined();
    await fetchUserInvoiceCheck(client, "MOBILE_BARCODE", "/ABC1234");
    expect(mobileCheck).toHaveBeenCalledTimes(1);
  });

  it("실패는 그대로 던진다(재시도 없음)", async () => {
    companyCheck.mockRejectedValue(new Error("500"));
    const client = new QueryClient();

    await expect(
      fetchUserInvoiceCheck(client, "COMPANY", "97025978"),
    ).rejects.toThrow("500");
    expect(companyCheck).toHaveBeenCalledTimes(1);
  });
});
