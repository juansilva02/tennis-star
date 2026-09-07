import { api } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/api";
import type { EntityRow } from "./entity-manager.types";

export function getEntities(resource: string, search: string, page: number, archive: boolean, showArchived: boolean) {
  return api<PaginatedResponse<EntityRow>>(`${resource}?page=${page}&pageSize=10&search=${encodeURIComponent(search)}${archive ? `&archived=${showArchived}` : ""}`);
}

export function saveEntity(resource: string, data: Record<string, unknown>, id?: string) {
  return api(`${resource}${id ? `/${id}` : ""}`, { method: id ? "PATCH" : "POST", body: JSON.stringify(data) });
}

export function removeEntity(resource: string, id: string, restore: boolean) {
  return api(`${resource}/${id}${restore ? "/restore" : ""}`, { method: restore ? "POST" : "DELETE" });
}
