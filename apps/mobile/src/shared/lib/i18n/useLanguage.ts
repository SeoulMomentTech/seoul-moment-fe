import { useEffect, useState } from "react";

import { AppState } from "react-native";

import { getDeviceLanguage, type LanguageType } from "./language";

/**
 * 기기 언어는 앱이 떠 있는 동안 바뀌지 않지만, 사용자가 설정에서 바꾸고 돌아오면 달라진다.
 * 포그라운드 복귀 시 재평가해서 쿼리 키가 새 언어로 갈아끼워지게 한다.
 */
export const useLanguage = (): LanguageType => {
  const [language, setLanguage] = useState(getDeviceLanguage);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "active") setLanguage(getDeviceLanguage());
    });

    return () => subscription.remove();
  }, []);

  return language;
};
