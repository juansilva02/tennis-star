"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type {
  Brand,
  Category,
  ProductFiltersState,
} from "@/features/products/types";

interface ProductFilterMenuProps {
  filters: ProductFiltersState;
  categories: Category[];
  brands: Brand[];
  onChange: <K extends keyof ProductFiltersState>(
    key: K,
    value: ProductFiltersState[K],
  ) => void;
}

export function ProductFilterMenu({
  filters,
  categories,
  brands,
  onChange,
}: ProductFilterMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCount = [
    filters.status,
    filters.categoryId,
    filters.brandId,
    filters.gender,
  ].filter(Boolean).length;

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideClick(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-app-select-content]")) {
        return;
      }
      if (!containerRef.current?.contains(target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <Button
        type="button"
        variant={activeCount ? "default" : "outline"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="product-filter-panel"
        onClick={() => setOpen((current) => !current)}
      >
        <SlidersHorizontal className="size-4" />
        Filtros
        {activeCount > 0 ? (
          <span
            className="grid size-5 place-items-center rounded-full bg-background text-xs text-foreground"
            aria-label={`${activeCount} filtros activos`}
          >
            {activeCount}
          </span>
        ) : null}
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="product-filter-panel"
            role="dialog"
            aria-labelledby="product-filter-title"
            className="absolute left-0 z-40 mt-3 w-[min(30rem,calc(100vw-2rem))] origin-top-left rounded-xl border bg-popover p-5 text-popover-foreground shadow-md sm:left-auto sm:right-0 sm:p-6 sm:origin-top-right"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -2, scale: 0.99 }}
            transition={{ duration: 0.14 }}
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <p id="product-filter-title" className="font-semibold">
                Filtrar productos
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-12 min-h-12"
                aria-label="Cerrar filtros"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                <span>Estado</span>
                <Select
                  value={filters.status}
                  onValueChange={(value) => onChange("status", value)}
                  ariaLabel="Filtrar por estado"
                  options={[
                    { value: "", label: "Todos los estados" },
                    { value: "ACTIVE", label: "Activos" },
                    { value: "DRAFT", label: "Borradores" },
                    { value: "INACTIVE", label: "Inactivos" },
                  ]}
                />
              </label>

              <label className="space-y-2 text-sm font-medium">
                <span>Categoría</span>
                <Select
                  value={filters.categoryId}
                  onValueChange={(value) => onChange("categoryId", value)}
                  ariaLabel="Filtrar por categoría"
                  options={[
                    { value: "", label: "Todas las categorías" },
                    ...categories.map((category) => ({
                      value: category.id,
                      label: category.name,
                    })),
                  ]}
                />
              </label>

              <label className="space-y-2 text-sm font-medium">
                <span>Marca</span>
                <Select
                  value={filters.brandId}
                  onValueChange={(value) => onChange("brandId", value)}
                  ariaLabel="Filtrar por marca"
                  options={[
                    { value: "", label: "Todas las marcas" },
                    ...brands.map((brand) => ({
                      value: brand.id,
                      label: brand.name,
                    })),
                  ]}
                />
              </label>

              <label className="space-y-2 text-sm font-medium">
                <span>Género</span>
                <Select
                  value={filters.gender}
                  onValueChange={(value) => onChange("gender", value)}
                  ariaLabel="Filtrar por género"
                  options={[
                    { value: "", label: "Todos los géneros" },
                    { value: "UNISEX", label: "Unisex" },
                    { value: "MEN", label: "Hombre" },
                    { value: "WOMEN", label: "Mujer" },
                    { value: "KIDS", label: "Niños" },
                  ]}
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end border-t pt-5">
              <Button type="button" onClick={() => setOpen(false)}>
                Listo
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
