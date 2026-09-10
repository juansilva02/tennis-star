"use client";

import { Archive, ArchiveRestore, Eye } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { MotionTableRow } from "@/components/motion/motion-primitives";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SaleListItem } from "@/features/sales/types";
import { cn, dateTime, money } from "@/lib/utils";

interface SalesTableProps {
  sales: SaleListItem[];
  hidden: boolean;
  pending: boolean;
  error: boolean;
  onRetry: () => void;
  onManage: (sale: SaleListItem) => void;
  onHide: (id: string) => void;
}

function customerInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export function SalesTable({
  sales,
  hidden,
  pending,
  error,
  onRetry,
  onManage,
  onHide,
}: SalesTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      {pending ? (
        <LoadingState className="h-72 rounded-none" label="Cargando ventas" />
      ) : error ? (
        <ErrorState message="No pudimos cargar las ventas." onRetry={onRetry} />
      ) : sales.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="hidden md:table-cell">Pago</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="hidden lg:table-cell">Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence initial={false}>
            {sales.map((sale) => (
              <MotionTableRow key={sale.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold">
                      {customerInitials(sale.customer.name)}
                    </div>
                    <span className="font-medium">{sale.customer.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  <span className="block max-w-40 truncate" title={sale.orderNumber}>#{sale.orderNumber}</span>
                </TableCell>
                <TableCell>
                  <StatusBadge value={sale.status} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <StatusBadge value={sale.paymentStatus} />
                </TableCell>
                <TableCell
                  className={cn(
                    "font-mono font-semibold",
                    sale.paymentStatus === "REFUNDED"
                      ? "text-destructive"
                      : "text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  {money.format(Number(sale.total))}
                  {sale.paymentStatus === "REFUNDED" ? (
                    <span className="block font-sans text-xs font-medium">
                      Reembolsado
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                  {dateTime.format(new Date(sale.createdAt))}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onManage(sale)}
                      aria-label="Gestionar pedido"
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onHide(sale.id)}
                      aria-label={hidden ? "Restaurar venta" : "Ocultar venta"}
                    >
                      {hidden ? (
                        <ArchiveRestore className="size-4" />
                      ) : (
                        <Archive className="size-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </MotionTableRow>
            ))}
          </AnimatePresence>
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          description="Todavía no hay ventas. Generá el primer pedido."
          className="h-64 min-h-0 p-0"
        />
      )}
    </div>
  );
}
