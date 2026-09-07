"use client";

import { ErrorState } from "@/components/feedback/error-state";
import { MotionItem, MotionStagger } from "@/components/motion/motion-primitives";
import { useDashboard } from "../hooks/use-dashboard";
import { InventoryCard } from "./inventory-card";
import { RecentSalesCard } from "./recent-sales-card";
import { TopProductsCard } from "./top-products-card";

export function Dashboard() {
  const dashboard = useDashboard();
  if (dashboard.isPending) return <DashboardSkeleton />;
  if (dashboard.isError) return <ErrorState message="No pudimos cargar el resumen." onRetry={() => dashboard.refetch()} />;
  const data = dashboard.data.data;
  return (
    <div className="mx-auto max-w-[1240px]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Inicio</h1>
        <p className="mt-1 text-sm text-muted-foreground">Una vista rápida de tu tienda.</p>
      </div>
      <MotionStagger className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MotionItem><InventoryCard productCount={data.productCount} inventoryValue={data.inventoryValue} products={data.products} /></MotionItem>
        <MotionItem><RecentSalesCard sales={data.recentSales} /></MotionItem>
        <MotionItem className="md:col-span-2 xl:col-span-1"><TopProductsCard products={data.topProducts} /></MotionItem>
      </MotionStagger>
    </div>
  );
}

function DashboardSkeleton() {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-xl border bg-muted/50" />)}</div>;
}
