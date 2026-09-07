import { api } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { StatisticsData } from "../types";

export function getStatistics(from: string, to: string) {
  const query = new URLSearchParams();
  if (from) query.set("from", from);
  if (to) query.set("to", to);
  return api<ApiResponse<StatisticsData>>(
    `/statistics${query.size ? `?${query}` : ""}`,
  );
}
