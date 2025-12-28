import { useMemo } from "react";

import type { Filter } from "@widgets/filter-sheet/ui/FilterSheet";

import { getOptionMetaById } from "../../lib/getOptionMetaById";
import useProductFilterList from "../../model/useProductFilterList";
import Options from "../Options";

interface OptionalFilters {
  filter: Filter;
  handleFilter(newFilter: Filter): void;
}

const OptionalFilters = ({ filter, handleFilter }: OptionalFilters) => {
  const { data } = useProductFilterList({
    categoryId: filter.categoryId as number,
    brandId: filter.brandId as number,
    productCategoryId: filter.productCategoryId as number,
  });

  const optionMetaById = useMemo(() => getOptionMetaById(data), [data]);

  const handleSelectOption = (id: number) => {
    const meta = optionMetaById[id];
    const currentIds = Array.isArray(filter.optionIdList)
      ? (filter.optionIdList as number[])
      : [];

    if (!meta) {
      handleFilter({ optionIdList: [id] });
      return;
    }

    const next = [
      ...currentIds.filter(
        (currentId) => optionMetaById[currentId]?.group !== meta.group,
      ),
      id,
    ];

    const uniqueNext = Array.from(new Set(next));

    handleFilter({ optionIdList: uniqueNext });
  };

  return (
    <Options
      data={data ?? []}
      handleSelectOption={handleSelectOption}
      selectedOptionIds={
        Array.isArray(filter.optionIdList)
          ? (filter.optionIdList as number[])
          : []
      }
    />
  );
};

export default OptionalFilters;
