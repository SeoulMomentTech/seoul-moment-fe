interface WithOptionIdList {
  optionIdList?: number[] | null;
  [key: string]: unknown;
}

export type OptionIdListValue = number[] | number | null | undefined;

export const mergeOptionIdList = <T extends WithOptionIdList>(
  base: T,
  optionIdList: OptionIdListValue,
): T => {
  if (optionIdList === undefined) {
    return base;
  }

  if (optionIdList === null) {
    return {
      ...base,
      optionIdList: null,
    };
  }

  const prevOptionIds = Array.isArray(base.optionIdList)
    ? (base.optionIdList as number[])
    : [];

  if (Array.isArray(optionIdList)) {
    const uniqueIds = optionIdList.filter(
      (id, index, arr) => typeof id === "number" && arr.indexOf(id) === index,
    );

    return {
      ...base,
      optionIdList: uniqueIds.length > 0 ? uniqueIds : null,
    };
  }

  if (typeof optionIdList === "number") {
    const exists = prevOptionIds.includes(optionIdList);
    const next = exists
      ? prevOptionIds.filter((id) => id !== optionIdList)
      : [...prevOptionIds, optionIdList];

    return {
      ...base,
      optionIdList: next.length > 0 ? next : null,
    };
  }

  return base;
};
