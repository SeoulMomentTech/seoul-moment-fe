"use client";

import { type PropsWithChildren } from "react";

import { Accordion } from "@seoul-moment/ui";
import { FilterSheet } from "@widgets/filter-sheet";

import BrandFilter from "./BrandFilter";
import CategoryFilter from "./CategoryFilter";
import OptionalFilters from "./OptionalFilters";

interface FilterSheetProps extends PropsWithChildren {
  isOpen: boolean;
  handleIsOpen(open: boolean): void;
}

const ProductFilterSheet = ({
  children,
  isOpen,
  handleIsOpen,
}: FilterSheetProps) => {
  return (
    <FilterSheet
      content={(filter, handleFilter) => (
        <Accordion defaultValue={["category", "brand"]} type="multiple">
          <CategoryFilter filter={filter} handleFilter={handleFilter} />
          <BrandFilter filter={filter} handleFilter={handleFilter} />
          {filter.categoryId && (
            <OptionalFilters filter={filter} handleFilter={handleFilter} />
          )}
        </Accordion>
      )}
      handleIsOpen={handleIsOpen}
      isOpen={isOpen}
    >
      {children}
    </FilterSheet>
  );
};

export default ProductFilterSheet;
