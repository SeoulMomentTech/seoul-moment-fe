import { useState } from "react";

import {
  LANGUAGES,
  LANGUAGE_LABELS,
  type LanguageType,
} from "@shared/lib/i18n/language";
import { setLanguage, useLanguage } from "@shared/lib/i18n/useLanguage";
import { useTranslations } from "@shared/lib/i18n/useTranslations";
import { Section } from "@shared/ui/section";
import { OptionSheet } from "@shared/ui/select";

import { MenuRow } from "./MenuRow";

const OPTIONS = LANGUAGES.map((language) => ({
  value: language,
  label: LANGUAGE_LABELS[language],
}));

/**
 * 언어를 고르는 줄.
 *
 * 고른 값은 기기 설정을 덮고 다시 고를 때까지 남는다. 그래서 "기기 설정 따름" 보기는
 * 두지 않았다 — web 도 세 가지뿐이고, 고른 적 없는 사람은 어차피 기기를 따라간다.
 *
 * 바꾸면 글자만 바뀌는 것이 아니라 상품·뉴스도 새 언어로 다시 받아진다(쿼리 키에
 * 언어가 들어 있다). 그래서 "적용" 같은 단추가 없다 — 고르는 순간이 곧 적용이다.
 */
export function LanguageSetting() {
  const t = useTranslations();
  const language = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <Section title={t("settings")}>
      <MenuRow
        label={t("language_setting")}
        onPress={() => setOpen(true)}
        value={LANGUAGE_LABELS[language]}
      />
      <OptionSheet
        clearable={false}
        onClose={() => setOpen(false)}
        onSelect={(next) => {
          setLanguage(next as LanguageType);
          setOpen(false);
        }}
        options={OPTIONS}
        title={t("language_setting")}
        value={language}
        visible={open}
      />
    </Section>
  );
}
