"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getBrands,
  getCategories,
  getProducts,
} from "@/features/products/api/products-api";
import type { ProductFiltersState } from "@/features/products/types";

export function useProducts(filters: ProductFiltersState) {
  return useQuery({
    queryKey: [
      "products",
      filters.search,
      filters.status,
      filters.categoryId,
      filters.brandId,
      filters.gender,
      filters.sort,
      filters.archived,
      filters.page,
    ],
    queryFn: () => getProducts(filters),
  });
}

export function useProductCatalogOptions() {
  const categories = useQuery({
    queryKey: ["categories-all"],
    queryFn: getCategories,
  });
  const brands = useQuery({
    queryKey: ["brands-all"],
    queryFn: getBrands,
  });
  return { categories, brands };
}
