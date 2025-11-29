import { fetcher } from ".";

interface ApiResponse<T> {
  result: boolean;
  data: T;
}

export interface AdminSignUpPayload {
  email: string;
  password: string;
  name: string;
}

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  refreshToken: string;
}

export interface AdminOneTimeTokenResponse {
  oneTimeToken: string;
}

export const postAdminSignUp = (payload: AdminSignUpPayload) =>
  fetcher.post<void>("/admin/auth/signup", payload);

export const postAdminLogin = (payload: AdminLoginPayload) =>
  fetcher.post<ApiResponse<AdminLoginResponse>>("/admin/auth/login", payload);

export const getAdminOneTimeToken = () =>
  fetcher.get<ApiResponse<AdminOneTimeTokenResponse>>(
    "/admin/auth/one-time-token",
  );
