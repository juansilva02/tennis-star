"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { updateSale } from "@/features/sales/api/sales-api";
import type {
  PaymentStatus,
  Sale,
  SaleStatus,
} from "@/features/sales/types";
import { getErrorMessage } from "@/lib/errors";
import { dateTime, money } from "@/lib/utils";

export function ManageSale({ sale, onDone }: { sale: Sale; onDone: () => void }) {
  const [status, setStatus] = useState<SaleStatus>(sale.status);
  const [payment, setPayment] = useState<PaymentStatus>(sale.paymentStatus);
  const [tracking, setTracking] = useState(sale.trackingId ?? "");
  const [address, setAddress] = useState(sale.shippingAddress);
  const [note, setNote] = useState("");
  const save = useMutation({
    mutationFn: (overrideStatus?: SaleStatus) =>
      updateSale(sale.id, {
        status: overrideStatus ?? status,
        paymentStatus: payment,
        trackingId: tracking,
        shippingAddress: address,
        statusNote: note,
      }),
    onSuccess: () => {
      toast.success("Pedido actualizado");
      onDone();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <>
      <DialogTitle>Gestionar orden #{sale.orderNumber}</DialogTitle>
      <DialogDescription>
        Actualizá el estado y revisá la información del pedido.
      </DialogDescription>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Información del cliente</h3>
            <p className="mt-2 text-sm">{sale.customer.name}</p>
            <p className="text-sm text-muted-foreground">
              {sale.customer.email}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Información de pago</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                Estado
                <Select
                  value={payment}
                  onValueChange={(value) =>
                    setPayment(value as PaymentStatus)
                  }
                  ariaLabel="Estado del pago"
                  className="mt-1"
                  options={[
                    { value: "UNPAID", label: "Pendiente" },
                    { value: "PAID", label: "Pagado" },
                    { value: "REFUNDED", label: "Reembolsado" },
                  ]}
                />
              </label>
              <div>
                <p className="text-sm">Total</p>
                <p className="mt-3 font-mono font-semibold text-emerald-600">
                  {money.format(Number(sale.total))}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Productos</h3>
            {sale.items.map((item) => (
              <div key={item.id} className="mt-2 flex justify-between text-sm">
                <span>
                  {item.quantity} × {item.productName}
                </span>
                <span className="font-mono">
                  {money.format(Number(item.subtotal))}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="space-y-4">
          <label className="block text-sm font-medium">
            Estado actual
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as SaleStatus)}
              ariaLabel="Estado actual"
              className="mt-2"
              options={[
                { value: "PENDING", label: "Pendiente" },
                { value: "PROCESSING", label: "En preparación" },
                { value: "SHIPPED", label: "Enviado" },
                { value: "COMPLETED", label: "Completado" },
                { value: "CANCELLED", label: "Cancelado" },
              ]}
            />
          </label>
          <label className="block text-sm font-medium">
            Dirección de envío
            <Input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="mt-2"
            />
          </label>
          <label className="block text-sm font-medium">
            ID de tracking
            <Input
              value={tracking}
              onChange={(event) => setTracking(event.target.value)}
              className="mt-2"
            />
          </label>
          <label className="block text-sm font-medium">
            Nota para el cambio
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-2"
            />
          </label>
          <div>
            <h3 className="mb-2 text-sm font-semibold">
              Historial de modificaciones
            </h3>
            <div className="max-h-36 space-y-2 overflow-y-auto border-l pl-4">
              {sale.history.map((history) => (
                <div key={history.id} className="text-xs">
                  <StatusBadge value={history.to} />
                  <span className="ml-2 text-muted-foreground">
                    {dateTime.format(new Date(history.createdAt))}
                  </span>
                  {history.note ? (
                    <p className="mt-1 text-muted-foreground">{history.note}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => save.mutate(undefined)}
              disabled={save.isPending}
            >
              Guardar cambios
            </Button>
            <Button
              variant="success"
              onClick={() => {
                setStatus("COMPLETED");
                save.mutate("COMPLETED");
              }}
            >
              <CheckCircle2 className="size-4" />
              Completar
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
