import type { ProductOption, ProductOptionInput } from "@/features/products/types";

export const DEFAULT_PRODUCT_OPTIONS: ProductOptionInput[] = [
  { name: "Color", values: [] },
  { name: "Talla", values: [] },
];

export function toProductOptionInputs(
  options?: ProductOption[],
): ProductOptionInput[] {
  const mapped =
    options?.map((option) => ({
      name: option.name,
      values: option.values.map((value) => value.value),
    })) ?? [];

  const hasColor = mapped.some(
    (option) => option.name.toLocaleLowerCase("es") === "color",
  );
  const hasSize = mapped.some((option) =>
    ["talla", "talle"].includes(option.name.toLocaleLowerCase("es")),
  );

  return [
    ...mapped,
    ...(!hasColor ? [DEFAULT_PRODUCT_OPTIONS[0]] : []),
    ...(!hasSize ? [DEFAULT_PRODUCT_OPTIONS[1]] : []),
  ];
}

export function cleanProductOptions(
  options: ProductOptionInput[],
): ProductOptionInput[] {
  return options
    .map((option) => ({
      name: option.name.trim(),
      values: [...new Set(option.values.map((value) => value.trim()))].filter(
        Boolean,
      ),
    }))
    .filter((option) => option.name && option.values.length > 0);
}

export function parseProductOptions(value: string): ProductOptionInput[] {
  return value
    .split(";")
    .map((part) => {
      const [name, values] = part.split("=");
      return {
        name: name?.trim(),
        values: (values ?? "")
          .split("|")
          .map((item) => item.trim())
          .filter(Boolean),
      };
    })
    .filter((option) => Boolean(option.name && option.values.length));
}
