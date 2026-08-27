import { StrictMode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import messages from "@/i18n/messages/ko.json";

import { render, waitFor } from "@testing-library/react";

const mutateLineLogin = vi.fn();
const mutateGoogleLogin = vi.fn();
const getValidLineIdToken = vi.fn();
const startLineLogin = vi.fn();
const isLineRedirectPending = vi.fn(() => false);

vi.mock("next/image", () => ({
  default: () => null,
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@shared/lib/hooks/useUserAuthStore", () => ({
  useUserAuthStore: () => vi.fn(),
}));

vi.mock("./SnsLinkConfirmDialog", () => ({
  SnsLinkConfirmDialog: () => null,
}));

vi.mock("../lib/googleIdentity", () => ({
  requestGoogleIdToken: vi.fn(),
  GoogleSignInCancelledError: class extends Error {},
}));

vi.mock("../lib/lineIdentity", () => ({
  isLineLoginConfigured: () => true,
  getValidLineIdToken: () => getValidLineIdToken(),
  startLineLogin: () => startLineLogin(),
  clearLineSession: vi.fn(),
  isLineRedirectPending: () => isLineRedirectPending(),
}));

vi.mock("../api/useLineLoginMutation", () => ({
  useLineLoginMutation: () => ({
    mutate: mutateLineLogin,
    isPending: false,
  }),
}));

vi.mock("../api/useGoogleLoginMutation", () => ({
  useGoogleLoginMutation: () => ({
    mutate: mutateGoogleLogin,
    isPending: false,
  }),
}));

const { SocialLoginButtons } = await import("./SocialLoginButtons");
const { markLineLoginPending } = await import("../lib/snsAuthStorage");

const PENDING_KEY = "sns:linePending";

const renderInStrictMode = () =>
  render(
    <StrictMode>
      <NextIntlClientProvider locale="ko" messages={messages}>
        <SocialLoginButtons />
      </NextIntlClientProvider>
    </StrictMode>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  window.sessionStorage.clear();
  isLineRedirectPending.mockReturnValue(false);
  getValidLineIdToken.mockResolvedValue("id-token");
});

describe("LIFF 리다이렉트 복귀 처리", () => {
  it("StrictMode 이중 실행에서도 login mutation을 정확히 1회 발사한다", async () => {
    markLineLoginPending();

    renderInStrictMode();

    await waitFor(() => {
      expect(mutateLineLogin).toHaveBeenCalledTimes(1);
    });
    expect(mutateLineLogin).toHaveBeenCalledWith({ idToken: "id-token" });
  });

  it("로그인을 마치면 pending 플래그를 지운다", async () => {
    markLineLoginPending();

    renderInStrictMode();

    await waitFor(() => {
      expect(mutateLineLogin).toHaveBeenCalledTimes(1);
    });
    expect(window.sessionStorage.getItem(PENDING_KEY)).toBeNull();
  });

  it("pending 플래그가 없으면 복귀 처리를 하지 않는다", async () => {
    renderInStrictMode();

    await waitFor(() => {
      expect(getValidLineIdToken).not.toHaveBeenCalled();
    });
    expect(mutateLineLogin).not.toHaveBeenCalled();
  });

  it("primary redirect 로드에서 토큰이 없으면 플래그를 남겨 다음 로드가 이어받게 한다", async () => {
    // LIFF 가 곧 secondary URL 로 이동시키는 로드다. 토큰 부재는 실패가 아니다.
    isLineRedirectPending.mockReturnValue(true);
    getValidLineIdToken.mockResolvedValue(null);
    markLineLoginPending();

    renderInStrictMode();

    await waitFor(() => {
      expect(getValidLineIdToken).toHaveBeenCalled();
    });
    expect(mutateLineLogin).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem(PENDING_KEY)).not.toBeNull();
  });

  it("리다이렉트 로드가 아니고 토큰도 없으면 취소로 보고 플래그를 지운다", async () => {
    getValidLineIdToken.mockResolvedValue(null);
    markLineLoginPending();

    renderInStrictMode();

    await waitFor(() => {
      expect(window.sessionStorage.getItem(PENDING_KEY)).toBeNull();
    });
    expect(mutateLineLogin).not.toHaveBeenCalled();
  });

  it("복귀 처리 중에는 LINE 버튼이 진행 상태가 되고 두 버튼 모두 잠긴다", async () => {
    // 핸드셰이크가 끝나지 않은 상태를 붙잡아 둔다.
    getValidLineIdToken.mockReturnValue(new Promise(() => {}));
    markLineLoginPending();

    const { queryByText, findByText, getAllByRole } = renderInStrictMode();

    expect(await findByText(`${messages.logging_in}...`)).toBeInTheDocument();
    // LINE 버튼 라벨이 진행 표시로 바뀐다.
    expect(queryByText(messages.login_in_with_line)).toBeNull();
    // 복귀 중에 다른 provider 로 새 로그인을 시작할 수 없다.
    for (const button of getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
  });

  it("만료된 pending 플래그는 무시한다", async () => {
    const sixMinutesAgo = Date.now() - 6 * 60 * 1000;
    window.sessionStorage.setItem(PENDING_KEY, String(sixMinutesAgo));

    renderInStrictMode();

    await waitFor(() => {
      expect(getValidLineIdToken).not.toHaveBeenCalled();
    });
    expect(mutateLineLogin).not.toHaveBeenCalled();
  });
});
