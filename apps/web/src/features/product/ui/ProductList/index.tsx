"use client";

import useMediaQuery from "@shared/lib/hooks/useMediaQuery";
import DeskTop from "./Desktop";
import Mobile from "./Mobile";
import useProductFilter from "../../model/useProductFilter";

export default function ProductList() {
  const isMobile = useMediaQuery("(max-width: 40rem)", false);
  const { filter, handleUpdateFilter, handleResetFilter } = useProductFilter();

  return (
    <>
      {isMobile ? (
        <Mobile
          filter={filter}
          handleResetFilter={handleResetFilter}
          handleUpdateFilter={handleUpdateFilter}
        />
      ) : (
        <DeskTop
          filter={filter}
          handleResetFilter={handleResetFilter}
          handleUpdateFilter={handleUpdateFilter}
        />
      )}
    </>
  );
}
