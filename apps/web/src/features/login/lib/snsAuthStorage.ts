const SIGNUP_TOKEN_KEY = "sns:signupToken";
const SIGNUP_EMAIL_KEY = "sns:signupEmail";

export interface SnsSignupContext {
  signupToken: string;
  email: string;
}

export const saveSnsSignupContext = ({
  signupToken,
  email,
}: SnsSignupContext) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SIGNUP_TOKEN_KEY, signupToken);
  window.sessionStorage.setItem(SIGNUP_EMAIL_KEY, email);
};

export const readSnsSignupContext = (): SnsSignupContext | null => {
  if (typeof window === "undefined") return null;
  const signupToken = window.sessionStorage.getItem(SIGNUP_TOKEN_KEY);
  const email = window.sessionStorage.getItem(SIGNUP_EMAIL_KEY);
  if (!signupToken || !email) return null;
  return { signupToken, email };
};

export const clearSnsSignupContext = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SIGNUP_TOKEN_KEY);
  window.sessionStorage.removeItem(SIGNUP_EMAIL_KEY);
};
