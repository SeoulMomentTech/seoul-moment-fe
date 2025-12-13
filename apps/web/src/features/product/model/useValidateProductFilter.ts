"use client";

import { useCallback, useEffect } from "react";

import { useSearchParams } from "next/navigation";

import useProductFilter from "./useProductFilter";

const useValidateProductFilter = () => {
  const params = useSearchParams();
  const { handleClearFilter } = useProductFilter();

  const brandId = params.get("brandId");
  const categoryId = params.get("categoryId");
  const productCategoryId = params.get("productCategoryId");

  const validateFilters = useCallback(() => {
    if (brandId && isNaN(Number(brandId))) {
      handleClearFilter({ brandId: null });
    }

    if (categoryId && isNaN(Number(categoryId))) {
      handleClearFilter({ categoryId: null });
    }

    if (productCategoryId && isNaN(Number(productCategoryId))) {
      handleClearFilter({ productCategoryId: null });
    }
  }, [brandId, categoryId, productCategoryId, handleClearFilter]);

  useEffect(() => {
    validateFilters();
  }, [validateFilters]);

  return null;
};

export default useValidateProductFilter;
