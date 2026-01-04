declare global {
  interface Window {
    __IS_SEOUL_MOMENT_APP__?: boolean;
    ReactNativeWebView?: {
      postMessage(message: string): void;
    };
  }
}

export {};
