import { api } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { StoreSettings } from "../types";

export const getSettings = () => api<ApiResponse<StoreSettings>>("/settings");
export const updateSettings = (settings: StoreSettings) => api<ApiResponse<StoreSettings>>("/settings", { method: "PATCH", body: JSON.stringify(settings) });
