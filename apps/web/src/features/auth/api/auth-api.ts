import { api } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { CurrentUser } from "../types";

export const getCurrentUser = () =>
  api<ApiResponse<CurrentUser>>("/auth/me");

export function uploadProfileAvatar(file: File) {
  const body = new FormData();
  body.append("file", file);
  return api<ApiResponse<CurrentUser>>("/auth/avatar", {
    method: "POST",
    body,
  });
}

export const removeProfileAvatar = () =>
  api<ApiResponse<CurrentUser>>("/auth/avatar", { method: "DELETE" });
