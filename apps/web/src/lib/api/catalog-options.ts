import { api } from "./client";
import type { PaginatedResponse } from "@/types/api";

// Reference catalogs use bounded requests without silently discarding later pages.
export async function getCatalogOptions<T>(resource: string) {
  const first = await api<PaginatedResponse<T>>(`${resource}?page=1&pageSize=100`);
  const data = [...first.data];
  for (let page = 2; page <= first.meta.pageCount; page++) {
    const next = await api<PaginatedResponse<T>>(`${resource}?page=${page}&pageSize=100`);
    data.push(...next.data);
  }
  return { ...first, data };
}
