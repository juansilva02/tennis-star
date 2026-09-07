import { Prisma } from "@prisma/client";
import { AdminService } from "./admin.service";

describe("Estadísticas de ventas", () => {
  it("calcula ingresos netos pagados y agrupa por fecha argentina", async () => {
    const paidSale = {
      createdAt: new Date("2026-09-07T00:30:00.000Z"),
      total: new Prisma.Decimal("89.00"),
      items: [
        {
          productName: "Raqueta Pro",
          quantity: 1,
          subtotal: new Prisma.Decimal("89.00"),
        },
      ],
    };
    const sale = {
      findMany: jest.fn().mockImplementation(({ where, include }) => {
        if (include?.items) return Promise.resolve([paidSale]);
        if (where?.paymentStatus === "REFUNDED") {
          return Promise.resolve([{ total: new Prisma.Decimal("49.90") }]);
        }
        return Promise.resolve([{ createdAt: paidSale.createdAt }]);
      }),
      count: jest.fn().mockImplementation(({ where }) =>
        Promise.resolve(where.status === "COMPLETED" ? 3 : 2),
      ),
    };
    const service = new AdminService({ sale } as never);

    const result = await service.statistics();

    expect(sale.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "COMPLETED",
          paymentStatus: "PAID",
        }),
      }),
    );
    expect(result.revenue.toFixed(2)).toBe("89.00");
    expect(result.orders).toBe(3);
    expect(result.paidOrders).toBe(1);
    expect(result.refundedTotal.toFixed(2)).toBe("49.90");
    expect(result.cancelledOrders).toBe(2);
    expect(result.trend).toEqual([
      { date: "2026-09-06", revenue: 89, orders: 1 },
    ]);
  });
});
