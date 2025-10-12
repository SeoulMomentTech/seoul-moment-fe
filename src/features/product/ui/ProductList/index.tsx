"use client";

import useFilter from "@shared/lib/hooks/useFilter";
import DeskTop from "./Desktop";
import Mobile from "./Mobile";

export default function ProductList() {
  const { filter, handleUpdateFilter, handleResetFilter } = useFilter();

  return (
    <>
      <DeskTop filter={filter} handleUpdateFilter={handleUpdateFilter} />
      <Mobile
        filter={filter}
        handleResetFilter={handleResetFilter}
        handleUpdateFilter={handleUpdateFilter}
      />
    </>
  );
}
