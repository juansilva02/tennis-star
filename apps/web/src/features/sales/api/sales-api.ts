import { api } from "@/lib/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  CreateSaleInput,
  DiscountPreview,
  Sale,
  SaleListItem,
  SaleCustomer,
  SaleProduct,
  TodaySalesSummary,
  UpdateSaleInput,
} from "@/features/sales/types";

export function getSales(search: string, hidden: boolean, page: number) {
  const query = new URLSearchParams({
    page: String(page),
    pageSize: "10",
    search,
    hidden: String(hidden),
  });
  return api<PaginatedResponse<SaleListItem>>(`/sales?${query}`);
}

export function getSale(id: string, signal?: AbortSignal) {
  return api<ApiResponse<Sale>>(`/sales/${id}`, { signal });
}

export function getTodaySalesSummary() {
  return api<ApiResponse<TodaySalesSummary>>("/sales/summary/today");
}

export interface SaleOptionsPage<T> { data: T[]; nextCursor: string | null }

export function getSaleCustomers(search: string, cursor?: string, signal?: AbortSignal) {
  const query = new URLSearchParams({ search, limit: "20", ...(cursor ? { cursor } : {}) });
  return api<SaleOptionsPage<SaleCustomer>>(`/sales/options/customers?${query}`, { signal });
}

export function getSaleProducts(search: string, cursor?: string, signal?: AbortSignal) {
  const query = new URLSearchParams({ search, limit: "20", ...(cursor ? { cursor } : {}) });
  return api<SaleOptionsPage<SaleProduct>>(`/sales/options/products?${query}`, { signal });
}

export function createSale(input: CreateSaleInput) {
  return api<ApiResponse<Sale>>("/sales", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function previewSaleDiscount(input: {
  discountCode: string;
  items: CreateSaleInput["items"];
}) {
  return api<ApiResponse<DiscountPreview>>("/sales/discounts/preview", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateSale(id: string, input: UpdateSaleInput) {
  return api<ApiResponse<Sale>>(`/sales/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function setSaleHidden(id: string, currentlyHidden: boolean) {
  return api<ApiResponse<Sale>>(
    `/sales/${id}${currentlyHidden ? "/restore" : ""}`,
    { method: currentlyHidden ? "POST" : "DELETE" },
  );
}
