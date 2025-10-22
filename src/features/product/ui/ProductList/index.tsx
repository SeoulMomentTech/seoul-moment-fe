"use client";

import useMediaQuery from "@/shared/lib/hooks/useMediaQuery";
import useFilter from "@shared/lib/hooks/useFilter";
import DeskTop from "./Desktop";
import Mobile from "./Mobile";

export default function ProductList() {
  const isMobile = useMediaQuery("(max-width: 40rem)", false);
  const { filter, handleUpdateFilter, handleResetFilter } = useFilter();

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
