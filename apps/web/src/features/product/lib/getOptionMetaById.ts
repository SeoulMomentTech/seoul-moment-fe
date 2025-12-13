import type { OptionInfo } from "@shared/services/product";

export interface OptionMeta {
  group: string;
  type: OptionInfo["type"];
}

export const getOptionMetaById = (
  options: OptionInfo[] | undefined,
): Record<number, OptionMeta> => {
  if (!options) {
    return {};
  }

  return options.reduce<Record<number, OptionMeta>>((acc, option) => {
    option.optionValueList.forEach((value) => {
      acc[value.optionId] = { group: option.title, type: option.type };
    });

    return acc;
  }, {});
};
