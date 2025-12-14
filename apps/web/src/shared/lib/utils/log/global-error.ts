import { resolveErrorType, type GlobalErrorType } from "./error-type";

export function buildGlobalErrorPayload(error: Error & { digest?: string }) {
  const { type, status, url } = resolveErrorType(error);

  return {
    type,
    status,
    url,
    name: error.name,
    message: error.message,
    stack: error.stack,
    digest: error.digest,
  };
}

export function shouldCollectGlobalError(
  type: GlobalErrorType,
  status?: number,
) {
  if (type === "API_ERROR") {
    return typeof status === "number" && status >= 500;
  }

  return true;
}
