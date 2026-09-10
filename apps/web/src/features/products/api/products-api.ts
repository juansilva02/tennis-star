import { api } from "@/lib/api/client";
import { getCatalogOptions } from "@/lib/api/catalog-options";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  Brand,
  Category,
  Product,
  ProductFiltersState,
  ProductImage,
  ProductPayload,
} from "@/features/products/types";

export function getProducts(filters: ProductFiltersState) {
  const [sortBy, sortOrder] = filters.sort.split(":");
  const query = new URLSearchParams({
    page: String(filters.page),
    pageSize: "10",
    search: filters.search,
    status: filters.status,
    categoryId: filters.categoryId,
    brandId: filters.brandId,
    gender: filters.gender,
    sortBy,
    sortOrder,
    archived: String(filters.archived),
  });
  return api<PaginatedResponse<Product>>(`/products?${query}`);
}

export function getCategories() {
  return getCatalogOptions<Category>("/categories");
}

export function getBrands() {
  return getCatalogOptions<Brand>("/brands");
}

export function saveProduct(payload: ProductPayload, id?: string) {
  return api<ApiResponse<Product>>(`/products${id ? `/${id}` : ""}`, {
    method: id ? "PATCH" : "POST",
    body: JSON.stringify(payload),
  });
}

export function setProductArchived(id: string, archived: boolean) {
  return api<ApiResponse<Product>>(
    `/products/${id}${archived ? "/restore" : ""}`,
    { method: archived ? "POST" : "DELETE" },
  );
}

export function importProducts(rows: ProductPayload[]) {
  return api<ApiResponse<Product[]>>("/products/import", {
    method: "POST",
    body: JSON.stringify(rows),
  });
}

export async function uploadProductImage(
  productId: string,
  file: File,
  altText: string,
) {
  const data = new FormData();
  data.append("file", file);
  data.append("productId", productId);
  data.append("altText", altText);
  data.append("isPrimary", "true");
  return api<ApiResponse<ProductImage>>("/uploads/products", {
    method: "POST",
    body: data,
  });
}
