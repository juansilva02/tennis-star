"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  saveProduct,
  uploadProductImage,
} from "@/features/products/api/products-api";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/features/products/lib/product-form-schema";
import {
  cleanProductOptions,
  toProductOptionInputs,
} from "@/features/products/lib/product-options";
import { ProductOptionsEditor } from "@/features/products/components/product-options-editor";
import { ProductImageField } from "@/features/products/components/product-image-field";
import type { Brand, Category, Product } from "@/features/products/types";
import { getErrorMessage } from "@/lib/errors";

interface ProductFormProps {
  initial: Product | null;
  categories: Category[];
  brands: Brand[];
  onDone: () => void;
}

export function ProductForm({
  initial,
  categories,
  brands,
  onDone,
}: ProductFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageAlt, setImageAlt] = useState(
    initial?.images.find((image) => image.isPrimary)?.altText ?? initial?.name ?? "",
  );
  const [savedProductId, setSavedProductId] = useState(initial?.id);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      sku: initial?.sku ?? "",
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      price: Number(initial?.price ?? 0),
      stock: initial?.stock ?? 0,
      gender: initial?.gender ?? "UNISEX",
      status: initial?.status ?? "ACTIVE",
      categoryId: initial?.categoryId ?? "",
      brandId: initial?.brandId ?? "",
      options: toProductOptionInputs(initial?.options),
    },
  });

  async function submit(values: ProductFormValues) {
    try {
      const saved = await saveProduct(
        {
          ...values,
          options: cleanProductOptions(values.options),
        },
        savedProductId,
      );
      setSavedProductId(saved.data.id);
      if (imageFile) {
        await uploadProductImage(
          saved.data.id,
          imageFile,
          imageAlt.trim() || values.name,
        );
      }
      toast.success("Producto guardado");
      onDone();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="mt-5 grid gap-4 sm:grid-cols-2"
    >
      <FormField label="Nombre" error={errors.name?.message}>
        <Input {...register("name")} />
      </FormField>
      <FormField label="SKU" error={errors.sku?.message}>
        <Input {...register("sku")} />
      </FormField>
      <FormField label="Precio USD" error={errors.price?.message}>
        <Input
          type="number"
          min="0"
          step="0.01"
          {...register("price", { valueAsNumber: true })}
        />
      </FormField>
      <FormField label="Stock informativo" error={errors.stock?.message}>
        <Input
          type="number"
          min="0"
          {...register("stock", { valueAsNumber: true })}
        />
      </FormField>
      <FormField label="Categoría" error={errors.categoryId?.message}>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              ariaLabel="Categoría"
              options={[
                { value: "", label: "Seleccionar" },
                ...categories.map((category) => ({
                  value: category.id,
                  label: category.name,
                })),
              ]}
            />
          )}
        />
      </FormField>
      <FormField label="Marca" error={errors.brandId?.message}>
        <Controller
          name="brandId"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              ariaLabel="Marca"
              options={[
                { value: "", label: "Seleccionar" },
                ...brands.map((brand) => ({
                  value: brand.id,
                  label: brand.name,
                })),
              ]}
            />
          )}
        />
      </FormField>
      <FormField label="Género">
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              ariaLabel="Género"
              options={[
                { value: "UNISEX", label: "Unisex" },
                { value: "MEN", label: "Hombre" },
                { value: "WOMEN", label: "Mujer" },
                { value: "KIDS", label: "Niños" },
              ]}
            />
          )}
        />
      </FormField>
      <FormField label="Estado">
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              ariaLabel="Estado"
              options={[
                { value: "ACTIVE", label: "Activo" },
                { value: "DRAFT", label: "Borrador" },
                { value: "INACTIVE", label: "Inactivo" },
              ]}
            />
          )}
        />
      </FormField>
      <FormField label="Descripción" className="sm:col-span-2">
        <Textarea {...register("description")} />
      </FormField>
      <div className="sm:col-span-2">
        <Controller
          name="options"
          control={control}
          render={({ field }) => (
            <ProductOptionsEditor value={field.value} onChange={field.onChange} />
          )}
        />
      </div>
      <ProductImageField
        currentUrl={initial?.imageUrl}
        file={imageFile}
        altText={imageAlt}
        onFileChange={setImageFile}
        onAltTextChange={setImageAlt}
      />
      <div className="flex justify-end sm:col-span-2">
        <Button disabled={isSubmitting}>
          {isSubmitting ? "Guardando y procesando..." : "Guardar producto"}
        </Button>
      </div>
    </form>
  );
}
