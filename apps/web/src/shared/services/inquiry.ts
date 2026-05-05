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

export const verifyRecaptcha = (token: string) =>
  api
    .post("auth/recaptcha", {
      json: { token },
    })
    .json<{ success: boolean }>();
