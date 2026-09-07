import { Prisma } from "@prisma/client";
import { argentinaDayRange } from "../common/argentina-time";
import { SalesService } from "./sales.service";

describe("Resumen diario de ventas", () => {
  it("usa los límites del día de Argentina aunque el servidor esté en UTC", () => {
    const range = argentinaDayRange(new Date("2026-09-06T02:30:00.000Z"));

    expect(range.from.toISOString()).toBe("2026-09-05T03:00:00.000Z");
    expect(range.to.toISOString()).toBe("2026-09-06T03:00:00.000Z");
  });

  it("cuenta y suma todas las ventas creadas durante el día", async () => {
    const prisma = {
      sale: {
        count: jest.fn().mockResolvedValue(3),
        aggregate: jest.fn().mockResolvedValue({
          _sum: { total: new Prisma.Decimal("159.90") },
        }),
      },
    };
    const service = new SalesService(prisma as never);

    const result = await service.todaySummary(
      new Date("2026-09-06T15:00:00.000Z"),
    );

    expect(result.count).toBe(3);
    expect(result.total.toFixed(2)).toBe("159.90");
    expect(prisma.sale.count).toHaveBeenCalledWith({
      where: {
        createdAt: {
          gte: new Date("2026-09-06T03:00:00.000Z"),
          lt: new Date("2026-09-07T03:00:00.000Z"),
        },
      },
    });
  });
});

describe("Cálculo monetario de ventas", () => {
  it("mantiene precisión decimal al sumar subtotales", () => {
    const total = new Prisma.Decimal("89.90")
      .mul(2)
      .add(new Prisma.Decimal("12.25"));
    expect(total.toFixed(2)).toBe("192.05");
  });
});

describe("Creación transaccional de ventas", () => {
  it("relee precios, calcula el total y conserva snapshots dentro de la transacción", async () => {
    const create = jest.fn(async ({ data }) => data);
    const tx = {
      product: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "product-1",
            name: "Raqueta Pro",
            sku: "RAQ-001",
            price: new Prisma.Decimal("89.90"),
          },
        ]),
      },
      storeSettings: {
        findUnique: jest.fn().mockResolvedValue({ orderPrefix: "TS" }),
      },
      sale: { create },
    };
    const prisma = {
      $transaction: jest.fn((callback) => callback(tx)),
    };
    const service = new SalesService(prisma as never);

    const result: any = await service.create({
      customerId: "customer-1",
      paymentMethod: "CREDIT_CARD",
      shippingAddress: "Av. Corrientes 1234, CABA",
      items: [{ productId: "product-1", quantity: 2 }],
    });

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.product.findMany).toHaveBeenCalledWith({
      where: { id: { in: ["product-1"] }, archivedAt: null },
    });
    expect(result.total.toFixed(2)).toBe("179.80");
    expect(result.items.create[0]).toEqual(
      expect.objectContaining({
        productName: "Raqueta Pro",
        sku: "RAQ-001",
        quantity: 2,
      }),
    );
  });
});
