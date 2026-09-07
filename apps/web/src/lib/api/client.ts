export const API_URL = "/api/v1";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function api<T = any>(path: string, init: RequestInit = {}) {
  const isForm =
    typeof FormData !== "undefined" && init.body instanceof FormData;
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...init.headers,
    },
  });
  if (res.status === 204) return undefined as T;
  const body = await res
    .json()
    .catch(() => ({ message: "No se pudo procesar la respuesta" }));
  if (!res.ok)
    throw new ApiError(
      res.status,
      Array.isArray(body.message)
        ? body.message.join(". ")
        : (body.message ?? "Ocurrió un error"),
    );
  return body as T;
}
