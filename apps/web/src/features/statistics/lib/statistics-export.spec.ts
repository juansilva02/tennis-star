import { describe, expect, it } from "vitest";
import { buildStatisticsCsv, statisticsFilename } from "./statistics-export";

const data = {
  availableYears: [2026],
  revenue: "732.00",
  orders: 9,
  paidOrders: 7,
  refundedOrders: 1,
  refundedTotal: "49.90",
  cancelledOrders: 2,
  averageTicket: "81.33",
  trend: [{ date: "2026-09-05", revenue: "200.00" }],
  topProducts: [{ name: "Raqueta; Pro", quantity: 3 }],
};

describe("exportación de estadísticas", () => {
  it("genera un CSV con resumen, tendencia y productos", () => {
    const csv = buildStatisticsCsv(data, "Septiembre de 2026");

    expect(csv).toContain("Ingresos netos (USD);732.00");
    expect(csv).toContain("Total reembolsado (USD);49.90");
    expect(csv).toContain("2026-09-05;200.00");
    expect(csv).toContain('1;"Raqueta; Pro";3');
  });

  it("genera nombres de archivo seguros", () => {
    expect(statisticsFilename("Año 2026", "pdf")).toBe(
      "tennis-star-estadisticas-ano-2026.pdf",
    );
  });
});
