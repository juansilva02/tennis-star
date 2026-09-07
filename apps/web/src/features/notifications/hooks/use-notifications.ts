import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteNotification, getNotifications, markAllNotificationsRead, setNotificationRead } from "../api/notifications-api";

export function useNotifications(unread: boolean) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["notifications", unread], queryFn: () => getNotifications(unread) });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });
  return {
    query,
    setRead: async (id: string, read: boolean) => { await setNotificationRead(id, read); await invalidate(); },
    markAllRead: async () => { await markAllNotificationsRead(); toast.success("Todas las notificaciones fueron marcadas como leídas"); await invalidate(); },
    remove: async (id: string) => { await deleteNotification(id); await invalidate(); },
  };
}
