import { api } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { Notification } from "../types";

export const getNotifications = (unread: boolean) => api<ApiResponse<Notification[]>>(`/notifications?unread=${unread}`);
export const setNotificationRead = (id: string, read: boolean) => api(`/notifications/${id}/read`, { method: "PATCH", body: JSON.stringify({ read }) });
export const markAllNotificationsRead = () => api("/notifications/read-all", { method: "POST" });
export const deleteNotification = (id: string) => api(`/notifications/${id}`, { method: "DELETE" });
