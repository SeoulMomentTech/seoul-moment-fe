import { useEffect, useState } from "react";

export default function useMediaQuery(query: string, defaultValue = false) {
  const [matches, setMatches] = useState(defaultValue);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQueryList = window.matchMedia(query);
    const listener = () => setMatches(mediaQueryList.matches);

    // 초기 상태 반영
    setMatches(mediaQueryList.matches);

    // 최신 브라우저
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", listener);
    } else {
      // 오래된 Safari 등
      mediaQueryList.addListener(listener);
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener("change", listener);
      } else {
        mediaQueryList.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}
