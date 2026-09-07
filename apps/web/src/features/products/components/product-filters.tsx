"use client";

import { ArchiveRestore, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  Brand,
  Category,
  ProductFiltersState,
} from "@/features/products/types";
import { ProductFilterMenu } from "./product-filter-menu";
import { ProductSortMenu } from "./product-sort-menu";

interface ProductFiltersProps {
  filters: ProductFiltersState;
  categories: Category[];
  brands: Brand[];
  hasActiveFilters: boolean;
  onChange: <K extends keyof ProductFiltersState>(
    key: K,
    value: ProductFiltersState[K],
  ) => void;
  onClear: () => void;
}

export function ProductFilters({
  filters,
  categories,
  brands,
  hasActiveFilters,
  onChange,
  onClear,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative min-w-64 flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(event) => onChange("search", event.target.value)}
          placeholder="Buscar por nombre, SKU o ID"
          className="pl-9"
        />
      </div>
      <ProductFilterMenu
        filters={filters}
        categories={categories}
        brands={brands}
        onChange={onChange}
      />
      <ProductSortMenu
        value={filters.sort}
        onChange={(value) => onChange("sort", value)}
      />
      {hasActiveFilters ? (
        <Button variant="ghost" onClick={onClear}>
          Limpiar filtros
        </Button>
      ) : null}
      <Button
        variant={filters.archived ? "default" : "outline"}
        onClick={() => onChange("archived", !filters.archived)}
      >
        <ArchiveRestore className="size-4" />
        {filters.archived ? "Ver activos" : "Ver archivados"}
      </Button>
    </div>
  );
}
