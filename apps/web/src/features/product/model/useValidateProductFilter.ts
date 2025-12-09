"use client";

import { useCallback, useEffect } from "react";

import { useSearchParams } from "next/navigation";

import useProductFilter from "./useProductFilter";

const useValidateProductFilter = () => {
  const params = useSearchParams();
  const { handleUpdateFilter } = useProductFilter();

  const brandId = params.get("brandId");
  const categoryId = params.get("categoryId");
  const productCategoryId = params.get("productCategoryId");

  const validateFilters = useCallback(() => {
    if (brandId && isNaN(Number(brandId))) {
      handleUpdateFilter({ brandId: null });
    }

    if (categoryId && isNaN(Number(categoryId))) {
      handleUpdateFilter({ categoryId: null });
    }

    if (productCategoryId && isNaN(Number(productCategoryId))) {
      handleUpdateFilter({ productCategoryId: null });
    }
  }, [brandId, categoryId, productCategoryId, handleUpdateFilter]);

  useEffect(() => {
    validateFilters();
  }, [validateFilters]);

  return null;
};

export default useValidateProductFilter;
