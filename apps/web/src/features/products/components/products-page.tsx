"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FileUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { setProductArchived } from "@/features/products/api/products-api";
import { CsvImporter } from "@/features/products/components/csv-importer";
import { ProductFilters } from "@/features/products/components/product-filters";
import { ProductForm } from "@/features/products/components/product-form";
import { ProductsTable } from "@/features/products/components/products-table";
import { useProductFilters } from "@/features/products/hooks/use-product-filters";
import {
  useProductCatalogOptions,
  useProducts,
} from "@/features/products/hooks/use-products";
import type { Product } from "@/features/products/types";
import { getErrorMessage } from "@/lib/errors";

export function ProductsPage() {
  const queryClient = useQueryClient();
  const { filters, updateFilter, clearFilters, hasActiveFilters } =
    useProductFilters();
  const products = useProducts(filters);
  const { categories, brands } = useProductCatalogOptions();
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  async function archive(id: string) {
    try {
      await setProductArchived(id, filters.archived);
      toast.success(
        filters.archived ? "Producto restaurado" : "Producto archivado",
      );
      setConfirmId(null);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  function refreshProducts() {
    void queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Productos"
        description="Gestioná el catálogo, precios y disponibilidad informativa."
      >
        <Button variant="outline" onClick={() => setImportOpen(true)}>
          <FileUp className="size-4" />
          Importar productos
        </Button>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          Nuevo producto
        </Button>
      </PageHeader>

      <ProductFilters
        filters={filters}
        categories={categories.data?.data ?? []}
        brands={brands.data?.data ?? []}
        hasActiveFilters={hasActiveFilters}
        onChange={updateFilter}
        onClear={clearFilters}
      />

      <ProductsTable
        products={products.data?.data ?? []}
        archived={filters.archived}
        pending={products.isPending}
        error={products.isError}
        onRetry={() => void products.refetch()}
        onEdit={(product) => {
          setEditing(product);
          setFormOpen(true);
        }}
        onArchive={setConfirmId}
      />

      <Pagination
        meta={products.data?.meta}
        onPage={(page) => updateFilter("page", page)}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>
            {editing ? "Editar producto" : "Nuevo producto"}
          </DialogTitle>
          <DialogDescription>
            Completá la información comercial. El stock es sólo informativo.
          </DialogDescription>
          <ProductForm
            initial={editing}
            categories={categories.data?.data ?? []}
            brands={brands.data?.data ?? []}
            onDone={() => {
              setFormOpen(false);
              refreshProducts();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>Importar productos</DialogTitle>
          <DialogDescription>
            Validá el archivo antes de confirmar la carga.
          </DialogDescription>
          <CsvImporter
            categories={categories.data?.data ?? []}
            brands={brands.data?.data ?? []}
            onDone={() => {
              setImportOpen(false);
              refreshProducts();
            }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirmId)}
        onOpenChange={(value) => {
          if (!value) setConfirmId(null);
        }}
        title={filters.archived ? "Restaurar producto" : "Archivar producto"}
        description={
          filters.archived
            ? "El producto volverá al catálogo activo."
            : "El producto dejará de aparecer en el catálogo activo, sin perder sus datos."
        }
        actionLabel={filters.archived ? "Restaurar" : "Archivar"}
        onConfirm={() => {
          if (confirmId) return archive(confirmId);
        }}
      />
    </div>
  );
}
