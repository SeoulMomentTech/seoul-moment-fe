interface GoogleIdConfiguration {
  client_id: string;
  callback(response: GoogleCredentialResponse): void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
  use_fedcm_for_prompt?: boolean;
  ux_mode?: "popup" | "redirect";
  context?: "signin" | "signup" | "use";
}

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
  clientId?: string;
}

/**
 * One Tap prompt 상태 알림.
 *
 * `use_fedcm_for_prompt: true` 이므로 FedCM 에서 지원되지 않는 메서드는
 * 아예 선언하지 않는다 — 런타임에는 남아 있지만 호출하면 GSI 가 경고를 찍고
 * 값도 신뢰할 수 없다. 컴파일 단계에서 막는 편이 낫다.
 *
 * 제외된 것: `isDisplayMoment` · `isDisplayed` · `isNotDisplayed` ·
 * `getNotDisplayedReason` (display moment 전체 미지원), `getSkippedReason` (미지원).
 */
interface GooglePromptNotification {
  /** FedCM 에서는 `user_cancel` 사유가 오지 않는 부분 지원. */
  isSkippedMoment(): boolean;
  isDismissedMoment(): boolean;
  /** `credential_returned` 는 성공 통보다 — 취소로 해석하면 안 된다. */
  getDismissedReason():
    | "credential_returned"
    | "cancel_called"
    | "flow_restarted";
  getMomentType(): "display" | "skipped" | "dismissed";
}

interface GoogleAccountsId {
  initialize(config: GoogleIdConfiguration): void;
  prompt(callback?: (notification: GooglePromptNotification) => void): void;
  cancel(): void;
  disableAutoSelect(): void;
}

interface Window {
  google?: {
    accounts: {
      id: GoogleAccountsId;
    };
  };
}
