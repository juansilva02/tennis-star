import { api } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { LoyaltyCustomer } from "../types";

export const getLoyaltyCustomers = (search: string) => api<ApiResponse<LoyaltyCustomer[]>>(`/loyalty?search=${encodeURIComponent(search)}`);
export const adjustLoyaltyPoints = (customerId: string, points: number, reason: string) => api(`/customers/${customerId}/loyalty`, { method: "POST", body: JSON.stringify({ points, reason }) });
