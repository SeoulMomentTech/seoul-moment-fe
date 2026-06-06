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

interface GooglePromptNotification {
  isNotDisplayed(): boolean;
  isSkippedMoment(): boolean;
  isDismissedMoment(): boolean;
  getNotDisplayedReason(): string;
  getSkippedReason(): string;
  getDismissedReason(): string;
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
