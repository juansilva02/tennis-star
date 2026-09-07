import { TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { money } from "@/lib/utils";
import type { TopProduct } from "../types";

export function TopProductsCard({ products }: { products: TopProduct[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between"><CardTitle>Productos más vendidos</CardTitle><TrendingUp className="size-4 text-muted-foreground" /></CardHeader>
      <CardContent>
        {products.length ? (
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={product.productName} className="flex items-center gap-3">
                <span className="grid size-7 place-items-center rounded-full bg-muted text-xs font-semibold">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{product.productName}</p>
                  <p className="text-xs text-muted-foreground">{product._sum.quantity} unidades</p>
                </div>
                <strong className="font-mono text-sm text-emerald-600 dark:text-emerald-400">{money.format(Number(product._sum.subtotal))}</strong>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState description="No hay productos destacados para mostrar." className="min-h-28 rounded-lg border border-dashed p-5" />
        )}
      </CardContent>
    </Card>
  );
}
