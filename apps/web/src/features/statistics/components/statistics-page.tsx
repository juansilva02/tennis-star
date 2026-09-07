"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ErrorState } from "@/components/feedback/error-state";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatisticsPeriodFilter } from "@/features/statistics/components/statistics-period-filter";
import { StatisticsReportExport } from "@/features/statistics/components/statistics-report-export";
import {
  getPeriodLabel,
  getStatisticsPeriodRange,
} from "@/features/statistics/lib/statistics-period";
import { cn, money } from "@/lib/utils";
import { getStatistics } from "../api/statistics-api";

export function StatisticsPage() {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const { from, to } = getStatisticsPeriodRange(year, month);
  const periodLabel = getPeriodLabel(year, month);
  const statistics = useQuery({
    queryKey: ["statistics", from, to],
    queryFn: () => getStatistics(from, to),
  });
  const data = statistics.data?.data;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader
        title="Estadísticas"
        description="Rendimiento comercial basado en ventas completadas."
      >
        <StatisticsReportExport
          data={data}
          periodLabel={periodLabel}
          loading={statistics.isPending}
        />
      </PageHeader>

      <StatisticsPeriodFilter
        year={year}
        month={month}
        availableYears={data?.availableYears ?? []}
        onYearChange={setYear}
        onMonthChange={setMonth}
        onClear={() => {
          setYear("");
          setMonth("");
        }}
      />

      {statistics.isPending ? (
        <div className="h-80 animate-pulse rounded-xl bg-muted" />
      ) : statistics.isError ? (
        <ErrorState onRetry={() => void statistics.refetch()} />
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Metric
              label="Ingresos netos"
              value={money.format(Number(data.revenue))}
              detail={`${data.paidOrders} ${data.paidOrders === 1 ? "pedido pagado" : "pedidos pagados"}`}
            />
            <Metric label="Pedidos completados" value={String(data.orders)} />
            <Metric
              label="Ticket promedio cobrado"
              value={money.format(Number(data.averageTicket))}
            />
            <Metric
              label="Reembolsos"
              value={money.format(Number(data.refundedTotal))}
              detail={`${data.refundedOrders} ${data.refundedOrders === 1 ? "pedido reembolsado" : "pedidos reembolsados"}`}
              tone="danger"
            />
            <Metric
              label="Pedidos cancelados"
              value={String(data.cancelledOrders)}
              tone="danger"
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de ingresos netos</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="h-72"
                  aria-label="Gráfico de ingresos netos por fecha"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.trend}>
                      <defs>
                        <linearGradient
                          id="sales"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip
                        formatter={(value) => money.format(Number(value))}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        fill="url(#sales)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Productos vendidos y cobrados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.topProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="grid size-7 place-items-center rounded-full bg-muted text-xs">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {product.name}
                    </span>
                    <span className="font-mono">{product.quantity} uds.</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "default" | "danger";
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-2 text-2xl font-semibold tabular-nums",
            tone === "danger" && "text-destructive",
          )}
        >
          {value}
        </p>
        {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
      </CardContent>
    </Card>
  );
}
