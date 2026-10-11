import { useCallback } from "react";

import type { MessageKey } from "./translate";
import { translate } from "./translate";
import { useLanguage } from "./useLanguage";

export type Translate = (
  key: MessageKey,
  values?: Record<string, string | number>,
) => string;

/**
 * 화면 문구를 고르는 함수. web 의 next-intl `useTranslations()` 와 같은 모양이라,
 * 두 앱을 오갈 때 호출부가 똑같이 읽힌다 — `t("save_changes")`.
 *
 * 언어는 useLanguage 가 들고 있다. 설정에서 언어를 바꾸고 돌아오면 그 즉시 다시 그려진다.
 */
export const useTranslations = (): Translate => {
  const language = useLanguage();

  return useCallback(
    (key, values) => translate(language, key, values),
    [language],
  );
};
