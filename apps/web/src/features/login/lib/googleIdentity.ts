let initialized = false;
let pendingResolve: ((token: string) => void) | null = null;
let pendingReject: ((error: Error) => void) | null = null;

const GIS_LOAD_TIMEOUT_MS = 5000;

export class GoogleSignInCancelledError extends Error {
  constructor() {
    super("Google sign-in cancelled");
    this.name = "GoogleSignInCancelledError";
  }
}

export class GoogleSignInUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleSignInUnavailableError";
  }
}

const waitForGoogle = (): Promise<NonNullable<Window["google"]>> => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }
    const start = Date.now();
    const tick = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google);
        return;
      }
      if (Date.now() - start > GIS_LOAD_TIMEOUT_MS) {
        reject(
          new GoogleSignInUnavailableError(
            "Google Identity Services 스크립트를 불러오지 못했습니다.",
          ),
        );
        return;
      }
      window.requestAnimationFrame(tick);
    };
    tick();
  });
};

const ensureInitialized = async () => {
  if (initialized) return;
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new GoogleSignInUnavailableError(
      "NEXT_PUBLIC_GOOGLE_CLIENT_ID 환경 변수가 설정되지 않았습니다.",
    );
  }
  const google = await waitForGoogle();
  google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      const resolve = pendingResolve;
      pendingResolve = null;
      pendingReject = null;
      resolve?.(response.credential);
    },
    auto_select: false,
    cancel_on_tap_outside: true,
    use_fedcm_for_prompt: true,
    ux_mode: "popup",
    context: "signin",
  });
  initialized = true;
};

export const requestGoogleIdToken = async (): Promise<string> => {
  await ensureInitialized();

  if (pendingReject) {
    pendingReject(new GoogleSignInCancelledError());
    pendingResolve = null;
    pendingReject = null;
  }

  return new Promise<string>((resolve, reject) => {
    pendingResolve = resolve;
    pendingReject = reject;

    window.google!.accounts.id.prompt((notification) => {
      if (
        notification.isNotDisplayed() ||
        notification.isSkippedMoment() ||
        notification.isDismissedMoment()
      ) {
        const rejectFn = pendingReject;
        pendingResolve = null;
        pendingReject = null;
        rejectFn?.(new GoogleSignInCancelledError());
      }
    });
  });
};
