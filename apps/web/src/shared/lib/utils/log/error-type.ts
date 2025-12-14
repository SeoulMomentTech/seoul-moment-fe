import { isKyError, type HTTPError } from "ky";

export type GlobalErrorType = "API_ERROR" | "RSC_ERROR" | "CLIENT_ERROR";

export function resolveErrorType(error: Error & { digest?: string }): {
  type: GlobalErrorType;
  status?: number;
  url?: string;
} {
  // ✅ API (ky)
  if (isKyError(error)) {
    const httpError = error as HTTPError;

    return {
      type: "API_ERROR",
      status: httpError.response?.status,
      url: httpError.response?.url,
    };
  }

  // ✅ RSC (서버 컴포넌트)
  if (error.digest) {
    return {
      type: "RSC_ERROR",
    };
  }

  // ✅ Client
  return {
    type: "CLIENT_ERROR",
  };
}
