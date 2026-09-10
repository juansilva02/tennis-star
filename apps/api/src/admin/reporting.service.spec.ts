import { Prisma } from "@prisma/client";
import { ReportingService } from "./reporting.service";

describe("Informes agregados", () => {
  it("conserva precisión, reembolsos y productos homónimos separados", async () => {
    const p = {
      sale: {
        aggregate: jest.fn(({ where }) => Promise.resolve({ _sum: { total: new Prisma.Decimal(where.paymentStatus === "PAID" ? "89.90" : "10.25") }, _count: { _all: where.paymentStatus === "PAID" ? 2 : 1 } })),
        count: jest.fn(({ where }) => Promise.resolve(where.status === "COMPLETED" ? 3 : 1)),
      },
      $queryRaw: jest.fn().mockResolvedValueOnce([{ year: 2026 }]).mockResolvedValueOnce([{ date: "2026-09-09", revenue: new Prisma.Decimal("89.90"), orders: 2 }]).mockResolvedValueOnce([
        { id: "product-a", name: "Raqueta", quantity: 2 }, { id: "product-b", name: "Raqueta", quantity: 1 },
      ]),
    };
    const result = await new ReportingService(p as never).statistics();
    expect(result.revenue.toFixed(2)).toBe("89.90");
    expect(result.averageTicket.toFixed(2)).toBe("44.95");
    expect(result.refundedTotal.toFixed(2)).toBe("10.25");
    expect(result.topProducts.map((p) => p.id)).toEqual(["product-a", "product-b"]);
    expect(result.availableYears).toEqual([2026]);
  });
  it("rechaza rangos inválidos antes de consultar", async () => {
    await expect(new ReportingService({} as never).statistics("bad")).rejects.toThrow("rango de fechas");
  });
});
