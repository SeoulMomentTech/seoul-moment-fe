import { getErrorMessage } from "./error-message";
import { notification } from "./notification";

export const handleAppQueryError = (
  err: Error,
  meta?: Record<string, unknown>,
) => {
  if (meta?.toastOnError) {
    const message =
      typeof meta.toastOnError === "string"
        ? meta.toastOnError
        : getErrorMessage(err);
    notification.error(message);
  }
};
