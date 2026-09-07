"use client";

import { useState } from "react";
import { FileDown, FileUp } from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { importProducts } from "@/features/products/api/products-api";
import { parseProductOptions } from "@/features/products/lib/product-options";
import type {
  Brand,
  Category,
  ProductGender,
  ProductPayload,
  ProductStatus,
} from "@/features/products/types";
import { getErrorMessage } from "@/lib/errors";

interface CsvImporterProps {
  categories: Category[];
  brands: Brand[];
  onDone: () => void;
}

interface CsvRow {
  sku?: string;
  name?: string;
  description?: string;
  price?: string;
  gender?: string;
  category?: string;
  brand?: string;
  stock?: string;
  status?: string;
  imageUrl?: string;
  options?: string;
}

type ImportCandidate = Omit<ProductPayload, "categoryId" | "brandId"> & {
  categoryId?: string;
  brandId?: string;
};

export function CsvImporter({
  categories,
  brands,
  onDone,
}: CsvImporterProps) {
  const [rows, setRows] = useState<ImportCandidate[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  function parse(file: File) {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const categoryIds = new Map(
          categories.map((category) => [
            category.name.toLowerCase(),
            category.id,
          ]),
        );
        const brandIds = new Map(
          brands.map((brand) => [brand.name.toLowerCase(), brand.id]),
        );
        const validationErrors: string[] = [];
        const mapped = result.data.map((row, index) => {
          const categoryId = categoryIds.get(
            String(row.category).toLowerCase(),
          );
          const brandId = brandIds.get(String(row.brand).toLowerCase());
          if (
            !row.sku ||
            !row.name ||
            !categoryId ||
            !brandId ||
            Number.isNaN(Number(row.price))
          ) {
            validationErrors.push(
              `Fila ${index + 2}: faltan datos o la categoría/marca no existe.`,
            );
          }
          return {
            sku: row.sku ?? "",
            name: row.name ?? "",
            description: row.description ?? "",
            price: Number(row.price),
            gender: (row.gender || "UNISEX") as ProductGender,
            stock: Number(row.stock || 0),
            status: (row.status || "ACTIVE") as ProductStatus,
            imageUrl: row.imageUrl || undefined,
            categoryId,
            brandId,
            options: parseProductOptions(row.options ?? ""),
          };
        });
        setRows(mapped);
        setErrors(validationErrors);
      },
    });
  }

  async function confirmImport() {
    try {
      await importProducts(rows as ProductPayload[]);
      toast.success(`${rows.length} productos importados`);
      onDone();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  function downloadTemplate() {
    const csv =
      "sku,name,description,price,gender,category,brand,stock,status,imageUrl,options\nTS-DEMO-01,Producto demo,Descripción,99.90,UNISEX,Calzado,Adidas,10,ACTIVE,,Color=Negro|Blanco;Talla=S|M|L";
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    anchor.download = "plantilla-productos.csv";
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  }

  return (
    <div className="mt-5 space-y-4">
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-muted">
          <FileUp className="size-4" />
          Seleccionar CSV
          <input
            className="sr-only"
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) parse(file);
            }}
          />
        </label>
        <Button variant="outline" onClick={downloadTemplate}>
          <FileDown className="size-4" />
          Descargar plantilla
        </Button>
      </div>
      {rows.length > 0 ? (
        <div className="rounded-lg border p-4">
          <p className="font-medium">Vista previa: {rows.length} filas</p>
          {errors.length ? (
            <ul className="mt-2 list-disc pl-5 text-sm text-red-600">
              {errors.slice(0, 8).map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-emerald-600">
              Todas las filas son válidas.
            </p>
          )}
        </div>
      ) : null}
      <div className="flex justify-end">
        <Button
          disabled={!rows.length || Boolean(errors.length)}
          onClick={confirmImport}
        >
          Confirmar importación
        </Button>
      </div>
    </div>
  );
}
