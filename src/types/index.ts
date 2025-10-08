import "react";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}

export interface PageParams<T> {
  params: Promise<T>;
}

export interface ModalStatus {
  open: boolean;
  type: string;
}
