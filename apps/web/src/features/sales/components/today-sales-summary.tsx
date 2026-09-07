"use client";

import { CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { money } from "@/lib/utils";
import { useTodaySalesSummary } from "../hooks/use-sales";

export function TodaySalesSummary() {
  const summary = useTodaySalesSummary();
  const data = summary.data?.data;

  return (
    <Card aria-label="Resumen de ventas de hoy">
      <CardContent className="flex min-h-24 items-center gap-4 p-4 sm:p-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CalendarDays className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">Ventas de hoy</p>
          {summary.isPending ? (
            <div className="mt-2 h-7 w-40 animate-pulse rounded bg-muted" role="status" aria-label="Cargando ventas de hoy" />
          ) : summary.isError ? (
            <button
              type="button"
              className="mt-1 min-h-11 text-left text-sm font-medium text-destructive underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => void summary.refetch()}
            >
              No se pudo cargar. Reintentar
            </button>
          ) : (
            <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="font-mono text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {money.format(Number(data?.total ?? 0))}
              </p>
              <p className="text-sm text-muted-foreground">
                {data?.count ?? 0} {(data?.count ?? 0) === 1 ? "pedido creado" : "pedidos creados"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
