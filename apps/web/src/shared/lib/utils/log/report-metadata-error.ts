import * as Sentry from "@sentry/nextjs";

export function reportMetadataError(
  operation: string,
  error: unknown,
  extra?: Record<string, unknown>,
) {
  Sentry.captureException(error, {
    tags: { operation },
    extra,
  });
}
