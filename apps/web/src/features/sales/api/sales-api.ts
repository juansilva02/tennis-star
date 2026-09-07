import { api } from "@/lib/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  CreateSaleInput,
  Sale,
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
  return api<PaginatedResponse<Sale>>(`/sales?${query}`);
}

export function getTodaySalesSummary() {
  return api<ApiResponse<TodaySalesSummary>>("/sales/summary/today");
}

export function getSaleCustomers() {
  return api<PaginatedResponse<SaleCustomer>>("/customers?pageSize=100");
}

export function getSaleProducts() {
  return api<PaginatedResponse<SaleProduct>>(
    "/products?pageSize=100&status=ACTIVE",
  );
}

export function createSale(input: CreateSaleInput) {
  return api<ApiResponse<Sale>>("/sales", {
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
