import { useCallback } from "react";

import useProductFilter from "./useProductFilter";

const useProductSearch = () => {
  const { filter, handleUpdateFilter } = useProductFilter();

  const handleSearch = useCallback(
    (query: string) => {
      handleUpdateFilter({ search: query })();
    },
    [handleUpdateFilter],
  );

  return {
    search: filter.search,
    handleSearch,
  };
};

export default useProductSearch;
