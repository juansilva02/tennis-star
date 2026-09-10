import { api } from "@/lib/api/client";
import type { PaginatedResponse } from "@/types/api";
import type { Notification } from "../types";

export const getNotifications = (unread: boolean, page: number) => api<PaginatedResponse<Notification>>(`/notifications?unread=${unread}&page=${page}`);
export const setNotificationRead = (id: string, read: boolean) => api(`/notifications/${id}/read`, { method: "PATCH", body: JSON.stringify({ read }) });
export const markAllNotificationsRead = () => api("/notifications/read-all", { method: "POST" });
export const deleteNotification = (id: string) => api(`/notifications/${id}`, { method: "DELETE" });
