import type { StatisticsData } from "../types";

function csvCell(value: string | number) {
  const text = String(value);
  return /[;"\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function csvRow(...values: Array<string | number>) {
  return values.map(csvCell).join(";");
}

export function buildStatisticsCsv(data: StatisticsData, periodLabel: string) {
  const rows = [
    csvRow("Informe de estadísticas", "Tennis Star"),
    csvRow("Período", periodLabel),
    "",
    csvRow("Resumen"),
    csvRow("Ingresos netos (USD)", data.revenue),
    csvRow("Pedidos completados", data.orders),
    csvRow("Pedidos completados y pagados", data.paidOrders),
    csvRow("Ticket promedio cobrado (USD)", data.averageTicket),
    csvRow("Pedidos reembolsados", data.refundedOrders),
    csvRow("Total reembolsado (USD)", data.refundedTotal),
    csvRow("Pedidos cancelados", data.cancelledOrders),
    "",
    csvRow("Tendencia de ingresos netos"),
    csvRow("Fecha", "Ingresos netos (USD)"),
    ...data.trend.map((item) => csvRow(item.date, item.revenue)),
    "",
    csvRow("Productos vendidos y cobrados"),
    csvRow("Posición", "Producto", "Unidades"),
    ...data.topProducts.map((product, index) =>
      csvRow(index + 1, product.name, product.quantity),
    ),
  ];

  return `\uFEFF${rows.join("\r\n")}`;
}

export function statisticsFilename(periodLabel: string, extension: "csv" | "pdf") {
  const period = periodLabel
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `tennis-star-estadisticas-${period || "historial"}.${extension}`;
}
