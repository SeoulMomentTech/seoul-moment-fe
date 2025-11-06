import type { LanguageType } from "@/i18n/const";
import "react";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PageParams<T extends Record<string, unknown> = {}> {
  params: Promise<T & { locale: LanguageType }>;
}

export interface ModalStatus {
  open: boolean;
  type: string;
}
