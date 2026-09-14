import { api } from ".";

interface PostEmailRequest {
  to: string;
  subject: string;
  name: string;
  html: string;
  /** 참조 수신자. 문의자가 인증한 이메일을 넣어 발송 내역을 함께 받게 한다. */
  cc?: string[];
}

export const postEmail = (data: PostEmailRequest) =>
  api
    .post("google/email", {
      json: data,
    })
    .json<{ success: boolean }>(); // 바로 json 파싱

export const verifyRecaptcha = (token: string) =>
  api
    .post("auth/recaptcha", {
      json: { token },
    })
    .json<{ success: boolean }>();
