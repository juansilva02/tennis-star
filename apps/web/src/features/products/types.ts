export type ProductGender = "UNISEX" | "MEN" | "WOMEN" | "KIDS";
export type ProductStatus = "ACTIVE" | "DRAFT" | "INACTIVE";

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
}

export interface Brand {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
}

export interface ProductOptionValue {
  id: string;
  value: string;
}

export interface ProductOption {
  id: string;
  name: string;
  values: ProductOptionValue[];
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  price: string;
  stock: number;
  gender: ProductGender;
  status: ProductStatus;
  imageUrl?: string | null;
  categoryId: string;
  brandId: string;
  category: Category;
  brand: Brand;
  options: ProductOption[];
  images: ProductImage[];
  archivedAt?: string | null;
}

export interface ProductFiltersState {
  search: string;
  status: string;
  categoryId: string;
  brandId: string;
  gender: string;
  sort: string;
  archived: boolean;
  page: number;
}

export interface ProductOptionInput {
  name: string;
  values: string[];
}

export interface ProductPayload {
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  gender: ProductGender;
  status: ProductStatus;
  categoryId: string;
  brandId: string;
  imageUrl?: string;
  options: ProductOptionInput[];
}
