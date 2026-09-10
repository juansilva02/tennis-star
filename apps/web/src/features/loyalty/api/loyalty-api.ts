import { api } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/api";
import type { LoyaltyCustomer } from "../types";

export const getLoyaltyCustomers = (search: string, page: number, sortOrder: string) => api<PaginatedResponse<LoyaltyCustomer>>(`/loyalty?search=${encodeURIComponent(search)}&page=${page}&sortOrder=${sortOrder}`);
export const adjustLoyaltyPoints = (customerId: string, points: number, reason: string) => api(`/customers/${customerId}/loyalty`, { method: "POST", body: JSON.stringify({ points, reason }) });
