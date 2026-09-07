"use client";

import Image from "next/image";
import { Archive, ArchiveRestore, Edit3, ImagePlus } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Product } from "@/features/products/types";
import { money } from "@/lib/utils";

interface ProductsTableProps {
  products: Product[];
  archived: boolean;
  pending: boolean;
  error: boolean;
  onRetry: () => void;
  onEdit: (product: Product) => void;
  onArchive: (id: string) => void;
}

export function ProductsTable({
  products,
  archived,
  pending,
  error,
  onRetry,
  onEdit,
  onArchive,
}: ProductsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      {pending ? (
        <LoadingState className="h-72 rounded-none" label="Cargando productos" />
      ) : error ? (
        <ErrorState message="No pudimos cargar los productos." onRetry={onRetry} />
      ) : products.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="hidden md:table-cell">Categoría</TableHead>
              <TableHead className="hidden lg:table-cell">Marca</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead className="hidden sm:table-cell">Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <ImagePlus className="absolute inset-0 m-auto size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {product.sku}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {product.category.name}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {product.brand.name}
                </TableCell>
                <TableCell className="font-mono">
                  {money.format(Number(product.price))}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {product.stock} uds.
                </TableCell>
                <TableCell>
                  <StatusBadge value={product.status} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(product)}
                      aria-label="Editar"
                    >
                      <Edit3 className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onArchive(product.id)}
                      aria-label={archived ? "Restaurar" : "Archivar"}
                    >
                      {archived ? (
                        <ArchiveRestore className="size-4" />
                      ) : (
                        <Archive className="size-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          description="No encontramos productos."
          className="h-64 min-h-0 p-0"
        />
      )}
    </div>
  );
}
