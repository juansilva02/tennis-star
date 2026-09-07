export function pageArgs(query: Record<string, string | undefined>) {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 10));
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
