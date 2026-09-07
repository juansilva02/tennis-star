import Link from "next/link";
import { EmptyState } from "@/components/feedback/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { dateTime, money } from "@/lib/utils";
import type { DashboardSale } from "../types";

export function RecentSalesCard({ sales }: { sales: DashboardSale[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Ventas recientes</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {sales.length ? sales.map((sale) => (
          <Link href="/ventas" key={sale.id} className="block rounded-xl border p-3 transition hover:bg-muted/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold leading-tight">{sale.customer.name}</p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">Orden #{sale.orderNumber}</p>
              </div>
              <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">{money.format(Number(sale.total))}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <StatusBadge value={sale.status} />
              <span className="text-[11px] text-muted-foreground">{dateTime.format(new Date(sale.createdAt))}</span>
            </div>
          </Link>
        )) : (
          <EmptyState description="Todavía no se registraron ventas." className="min-h-28 rounded-lg border border-dashed p-5" />
        )}
      </CardContent>
    </Card>
  );
}
