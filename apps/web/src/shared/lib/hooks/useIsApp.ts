import { useEffect, useState } from "react";

export default function useIsApp() {
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const value =
      window.__IS_SEOUL_MOMENT_APP__ === true || !!window.ReactNativeWebView;

    setIsApp(value);
  }, []);

  return isApp;
}
