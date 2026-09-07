import { api } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { DashboardData } from "../types";

export function getDashboard() {
  return api<ApiResponse<DashboardData>>("/dashboard");
}
