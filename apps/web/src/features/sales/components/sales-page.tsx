"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import { setSaleHidden } from "@/features/sales/api/sales-api";
import { ManageSale } from "@/features/sales/components/manage-sale";
import { NewSaleForm } from "@/features/sales/components/new-sale-form";
import { SalesFilters } from "@/features/sales/components/sales-filters";
import { SalesTable } from "@/features/sales/components/sales-table";
import { TodaySalesSummary } from "@/features/sales/components/today-sales-summary";
import { useSales } from "@/features/sales/hooks/use-sales";
import type { Sale } from "@/features/sales/types";
import { getErrorMessage } from "@/lib/errors";

export function SalesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hidden, setHidden] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Sale | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const sales = useSales(search, hidden, page);

  function refreshSales() {
    void queryClient.invalidateQueries({ queryKey: ["sales"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }

  async function hide(id: string) {
    try {
      await setSaleHidden(id, hidden);
      toast.success(hidden ? "Venta restaurada" : "Venta ocultada");
      setConfirmId(null);
      refreshSales();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Ventas"
        description="Registrá pedidos y seguí su evolución."
      >
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Nuevo pedido
        </Button>
      </PageHeader>

      <TodaySalesSummary />

      <SalesFilters
        search={search}
        hidden={hidden}
        onSearchChange={setSearch}
        onHiddenChange={setHidden}
      />

      <SalesTable
        sales={sales.data?.data ?? []}
        hidden={hidden}
        pending={sales.isPending}
        error={sales.isError}
        onRetry={() => void sales.refetch()}
        onManage={setSelected}
        onHide={setConfirmId}
      />

      <Pagination meta={sales.data?.meta} onPage={setPage} />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>Generar venta</DialogTitle>
          <DialogDescription>
            Elegí un cliente y los productos del pedido.
          </DialogDescription>
          <NewSaleForm
            onDone={() => {
              setCreateOpen(false);
              refreshSales();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(value) => {
          if (!value) setSelected(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          {selected ? (
            <ManageSale
              sale={selected}
              onDone={() => {
                setSelected(null);
                refreshSales();
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirmId)}
        onOpenChange={(value) => {
          if (!value) setConfirmId(null);
        }}
        title={hidden ? "Restaurar venta" : "Ocultar venta"}
        description={
          hidden
            ? "La venta volverá al listado principal."
            : "La venta se ocultará sin eliminar sus datos ni su historial."
        }
        actionLabel={hidden ? "Restaurar venta" : "Ocultar venta"}
        onConfirm={() => {
          if (confirmId) return hide(confirmId);
        }}
      />
    </div>
  );
}
