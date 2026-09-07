"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Minus, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/errors";
import { adjustLoyaltyPoints, getLoyaltyCustomers } from "../api/loyalty-api";
import type { LoyaltyCustomer } from "../types";

type SortOrder = "desc" | "asc";
type AdjustmentMode = "add" | "remove";

interface AdjustmentState {
  customer: LoyaltyCustomer;
  mode: AdjustmentMode;
}

export function LoyaltyPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [adjustment, setAdjustment] = useState<AdjustmentState | null>(null);
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("");
  const customers = useQuery({
    queryKey: ["loyalty", search],
    queryFn: () => getLoyaltyCustomers(search),
  });
  const sortedCustomers = useMemo(
    () =>
      [...(customers.data?.data ?? [])].sort((a, b) =>
        sortOrder === "asc" ? a.points - b.points : b.points - a.points,
      ),
    [customers.data?.data, sortOrder],
  );
  const save = useMutation({
    mutationFn: () => {
      const amount = Math.abs(Number(points));
      return adjustLoyaltyPoints(
        adjustment!.customer.id,
        adjustment!.mode === "add" ? amount : -amount,
        reason.trim(),
      );
    },
    onSuccess: () => {
      toast.success(adjustment?.mode === "add" ? "Puntos sumados" : "Puntos quitados");
      setAdjustment(null);
      void queryClient.invalidateQueries({ queryKey: ["loyalty"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  function openAdjustment(customer: LoyaltyCustomer, mode: AdjustmentMode) {
    setAdjustment({ customer, mode });
    setPoints("");
    setReason("");
  }

  const isAdding = adjustment?.mode === "add";
  const numericPoints = Number(points);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        title="Puntos de lealtad"
        description="Consultá saldos y registrá movimientos manuales."
      />

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_240px]">
        <label className="relative block">
          <span className="sr-only">Buscar cliente</span>
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar cliente"
            className="pl-9"
          />
        </label>
        <Select
          value={sortOrder}
          onValueChange={(value) => setSortOrder(value as SortOrder)}
          ariaLabel="Ordenar clientes por puntos"
          options={[
            { value: "desc", label: "Más puntos primero" },
            { value: "asc", label: "Menos puntos primero" },
          ]}
        />
      </div>

      {customers.isPending ? (
        <LoadingState label="Cargando saldos de lealtad" />
      ) : customers.isError ? (
        <ErrorState onRetry={() => void customers.refetch()} />
      ) : sortedCustomers.length === 0 ? (
        <div className="rounded-xl border bg-card">
          <EmptyState
            title="No se encontraron clientes"
            description="Probá con otro nombre o correo electrónico."
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Cliente</TableHead>
                <TableHead>Correo electrónico</TableHead>
                <TableHead
                  aria-sort={sortOrder === "asc" ? "ascending" : "descending"}
                  className="w-36"
                >
                  <span className="inline-flex items-center gap-1.5">
                    Saldo
                    {sortOrder === "asc" ? <ArrowUp className="size-3.5" aria-hidden="true" /> : <ArrowDown className="size-3.5" aria-hidden="true" />}
                  </span>
                </TableHead>
                <TableHead className="w-[290px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                  <TableCell className="font-mono font-semibold tabular-nums">
                    {customer.points.toLocaleString("es-AR")} pts.
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openAdjustment(customer, "add")}
                        aria-label={`Sumar puntos a ${customer.name}`}
                      >
                        <Plus className="size-4" aria-hidden="true" />
                        Sumar puntos
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => openAdjustment(customer, "remove")}
                        aria-label={`Quitar puntos a ${customer.name}`}
                      >
                        <Minus className="size-4" aria-hidden="true" />
                        Quitar puntos
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!adjustment} onOpenChange={(open) => !open && setAdjustment(null)}>
        <DialogContent>
          <DialogTitle>{isAdding ? "Sumar puntos" : "Quitar puntos"}</DialogTitle>
          <DialogDescription>
            {adjustment?.customer.name} · Saldo actual: {adjustment?.customer.points.toLocaleString("es-AR")} puntos
          </DialogDescription>
          <div className="mt-5 space-y-4">
            <label className="block text-sm font-medium">
              Cantidad de puntos
              <Input
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={points}
                onChange={(event) => setPoints(event.target.value)}
                className="mt-2"
                autoFocus
              />
            </label>
            <label className="block text-sm font-medium">
              Motivo
              <Textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="mt-2"
                placeholder="Describí el motivo del movimiento"
              />
            </label>
            <Button
              className="w-full"
              variant={isAdding ? "default" : "destructive"}
              disabled={!Number.isInteger(numericPoints) || numericPoints <= 0 || !reason.trim() || save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending ? "Guardando…" : isAdding ? "Confirmar suma" : "Confirmar descuento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
