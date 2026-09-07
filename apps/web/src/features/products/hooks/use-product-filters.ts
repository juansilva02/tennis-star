"use client";

import { useState } from "react";
import type { ProductFiltersState } from "@/features/products/types";

const initialFilters: ProductFiltersState = {
  search: "",
  status: "",
  categoryId: "",
  brandId: "",
  gender: "",
  sort: "createdAt:desc",
  archived: false,
  page: 1,
};

export function useProductFilters() {
  const [filters, setFilters] = useState<ProductFiltersState>(initialFilters);

  function updateFilter<K extends keyof ProductFiltersState>(
    key: K,
    value: ProductFiltersState[K],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearFilters() {
    setFilters((current) => ({
      ...initialFilters,
      archived: current.archived,
      sort: current.sort,
      page: current.page,
    }));
  }

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.status ||
      filters.categoryId ||
      filters.brandId ||
      filters.gender,
  );

  return { filters, updateFilter, clearFilters, hasActiveFilters };
}
