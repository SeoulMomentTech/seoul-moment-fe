import type { LanguageType } from "./language";
import en from "./messages/en.json";
import ko from "./messages/ko.json";
import zhTW from "./messages/zh-TW.json";

/**
 * 쓸 수 있는 키. 시트에 없는 키를 적으면 타입이 막는다 — 300군데가 넘는 호출부에서
 * 오타 하나가 화면에 키 이름으로 새어 나오지 않게 한다.
 */
export type MessageKey = keyof typeof en;

/**
 * 세 묶음을 모두 번들에 싣는다. 합쳐 60KB 남짓이라 쪼갤 값이 아니고,
 * 기기 언어는 앱이 떠 있는 동안에도 바뀔 수 있어(설정에서 바꾸고 복귀) 그때 바로 갈아끼워야 한다.
 */
const packs: Record<LanguageType, Partial<Record<MessageKey, string>>> = {
  ko,
  en,
  "zh-TW": zhTW,
};

/** `{name}` 자리에 값을 끼운다. 시트에는 복수형도 태그도 없고 이 치환뿐이다. */
const interpolate = (
  template: string,
  values: Record<string, string | number>,
) =>
  template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );

/**
 * 한 줄을 고른다. 고른 언어에 없으면 영어로, 영어에도 없으면 키를 그대로 돌려준다 —
 * 빈 화면보다는 키라도 보이는 편이 어디가 빠졌는지 말해 준다.
 *
 * 컴포넌트 밖에서 쓸 일이 있을 때만 직접 부르고, 화면 안에서는 useTranslations 를 쓴다.
 */
export const translate = (
  language: LanguageType,
  key: MessageKey,
  values?: Record<string, string | number>,
): string => {
  const template = packs[language][key] || en[key] || key;

  return values ? interpolate(template, values) : template;
};
