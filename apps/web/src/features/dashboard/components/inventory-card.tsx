import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { money } from "@/lib/utils";
import type { DashboardData } from "../types";

type InventoryCardProps = Pick<DashboardData, "productCount" | "inventoryValue" | "products">;

export function InventoryCard({ productCount, inventoryValue, products }: InventoryCardProps) {
  const router = useRouter();
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Inventario de productos</CardTitle>
        <Package className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="text-3xl font-semibold tabular-nums">{productCount}</div>
          <p className="text-xs text-muted-foreground">Productos en inventario</p>
          <p className="mt-1 text-sm font-medium">Valor: {money.format(Number(inventoryValue))}</p>
        </div>
        <div className="space-y-2">
          {products.slice(0, 7).map((product) => (
            <div key={product.id} className="flex items-center gap-3 text-sm">
              <div className="relative size-8 shrink-0 overflow-hidden rounded-md bg-muted">
                {product.imageUrl && <Image src={product.imageUrl} alt="" fill sizes="32px" className="object-cover" />}
              </div>
              <span className="min-w-0 flex-1 truncate font-medium">{product.name}</span>
              <span className="tabular-nums text-muted-foreground">{product.stock} uds.</span>
            </div>
          ))}
        </div>
        {productCount > products.length && (
          <p className="mt-3 text-center text-xs text-muted-foreground">+{productCount - products.length} productos más</p>
        )}
        <div className="mt-5 flex justify-between">
          <Button size="sm" onClick={() => router.push("/productos")}><Plus className="size-4" />Añadir</Button>
          <Button size="sm" variant="outline" onClick={() => router.push("/productos")}>
            Ver todos<ArrowRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
