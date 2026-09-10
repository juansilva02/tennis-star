import { BadRequestException } from "@nestjs/common";

export function pageArgs(query: Record<string, string | undefined>) {
  if (Object.values(query).some((value) => value !== undefined && typeof value !== "string")) throw new BadRequestException("Parámetros de consulta inválidos");
  const page = Number(query.page ?? 1);
  const pageSize = Number(query.pageSize ?? 10);
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100 || (page - 1) * pageSize > 2147483647) {
    throw new BadRequestException("Paginación inválida: page >= 1 y pageSize entre 1 y 100");
  }
  return { page, pageSize, skip: (page - 1) * pageSize };
}

export function paged<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  return {
    data,
    meta: { total, page, pageSize, pageCount: Math.ceil(total / pageSize) },
  };
}
