import { api } from ".";

interface PostEmailRequest {
  to: string;
  subject: string;
  name: string;
  html: string;
}

export const postEmail = (data: PostEmailRequest) =>
  api
    .post("google/email", {
      json: data,
    })
    .json<{ success: boolean }>(); // 바로 json 파싱

export const postEmailCode = (email: string) =>
  api
    .post("email/code", {
      json: { email },
    })
    .json<{ success: boolean }>();

interface VerifyEmailCodeRequest {
  email: string;
  code: string;
}

export const verifyEmailCode = ({ email, code }: VerifyEmailCodeRequest) =>
  api
    .post("email/verify", {
      json: { email, code },
    })
    .json<{ success: boolean }>();

export const verifyRecaptcha = (token: string) =>
  api
    .post("recaptcha", {
      json: { token },
    })
    .json<{ success: boolean }>();
