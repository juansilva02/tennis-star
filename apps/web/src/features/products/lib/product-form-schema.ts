import { z } from "zod";

export const productFormSchema = z.object({
  sku: z.string().trim().min(1, "Ingresá un SKU."),
  name: z.string().trim().min(2, "Ingresá un nombre válido."),
  description: z.string(),
  price: z.number().min(0, "El precio no puede ser negativo."),
  stock: z.number().int().min(0, "El stock no puede ser negativo."),
  gender: z.enum(["UNISEX", "MEN", "WOMEN", "KIDS"]),
  status: z.enum(["ACTIVE", "DRAFT", "INACTIVE"]),
  categoryId: z.string().min(1, "Seleccioná una categoría."),
  brandId: z.string().min(1, "Seleccioná una marca."),
  options: z.array(
    z.object({
      name: z.string(),
      values: z.array(z.string()),
    }),
  ),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
