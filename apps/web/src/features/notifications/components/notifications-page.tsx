"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Check, Mail, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Card, CardContent } from "@/components/ui/card";
import { dateTime } from "@/lib/utils";
import { useNotifications } from "../hooks/use-notifications";

export function NotificationsPage() {
  const [unread, setUnread] = useState(false);
  const [page, setPage] = useState(1);
  const notifications = useNotifications(unread, page);
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader title="Notificaciones" description="Novedades y actividad importante de la tienda.">
        <Button variant="outline" onClick={notifications.markAllRead}><Check className="size-4" />Marcar todas como leídas</Button>
      </PageHeader>
      <div className="flex gap-2">
        <Button size="sm" variant={!unread ? "default" : "outline"} onClick={() => { setUnread(false); setPage(1); }}>Todas</Button>
        <Button size="sm" variant={unread ? "default" : "outline"} onClick={() => { setUnread(true); setPage(1); }}>No leídas</Button>
      </div>
      <div className="space-y-3">
        {notifications.query.isPending ? <LoadingState /> : notifications.query.isError ? <ErrorState onRetry={() => void notifications.query.refetch()} /> : notifications.query.data?.data?.length ? (
          <AnimatePresence initial={false} mode="popLayout">
            {notifications.query.data.data.map((notification) => (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                <Card key={notification.id} className={!notification.readAt ? "border-emerald-500/40" : ""}>
            <CardContent className="flex gap-4 p-5">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-muted"><Bell className="size-4" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{notification.title}</p>{!notification.readAt && <Badge variant="success">Nueva</Badge>}</div>
                <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">{dateTime.format(new Date(notification.createdAt))}</p>
              </div>
              <div className="flex">
                <Button variant="ghost" size="icon" onClick={() => notifications.setRead(notification.id, !notification.readAt)} aria-label={notification.readAt ? "Marcar no leída" : "Marcar leída"}>
                  {notification.readAt ? <Mail className="size-4" /> : <Check className="size-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => notifications.remove(notification.id)} aria-label="Eliminar"><Trash2 className="size-4" /></Button>
              </div>
            </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <Card><CardContent><EmptyState description="No hay notificaciones para mostrar." className="min-h-40 p-0" /></CardContent></Card>
        )}
      </div>
      <Pagination meta={notifications.query.data?.meta} onPage={setPage} />
    </div>
  );
}
