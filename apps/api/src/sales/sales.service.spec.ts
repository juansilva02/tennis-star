import { Prisma } from "@prisma/client";
import { argentinaDayRange } from "../common/argentina-time";
import { discountAmountFor, SalesService } from "./sales.service";

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

  it("calcula porcentajes con dos decimales", () => {
    const amount = discountAmountFor(
      { type: "PERCENTAGE", value: new Prisma.Decimal("15") },
      new Prisma.Decimal("89.90"),
    );

    expect(amount.toFixed(2)).toBe("13.49");
  });

  it("limita un monto fijo al subtotal de la venta", () => {
    const amount = discountAmountFor(
      { type: "FIXED", value: new Prisma.Decimal("100") },
      new Prisma.Decimal("50"),
    );

    expect(amount.toFixed(2)).toBe("50.00");
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

  it("valida el código y guarda el descuento calculado por la API", async () => {
    const create = jest.fn(async ({ data }) => data);
    const tx = {
      product: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "product-1",
            name: "Raqueta Pro",
            sku: "RAQ-001",
            price: new Prisma.Decimal("200"),
          },
        ]),
      },
      discount: {
        findUnique: jest.fn().mockResolvedValue({
          id: "discount-1",
          code: "TENIS10",
          name: "Descuento tenis",
          type: "PERCENTAGE",
          value: new Prisma.Decimal("10"),
          active: true,
          startsAt: null,
          endsAt: null,
        }),
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
      discountCode: " tenis10 ",
      items: [{ productId: "product-1", quantity: 1 }],
    });

    expect(tx.discount.findUnique).toHaveBeenCalledWith({
      where: { code: "TENIS10" },
    });
    expect(result.subtotal.toFixed(2)).toBe("200.00");
    expect(result.discountAmount.toFixed(2)).toBe("20.00");
    expect(result.total.toFixed(2)).toBe("180.00");
    expect(result.discountCode).toBe("TENIS10");
  });
});

describe("Búsqueda paginada de opciones", () => {
  it("devuelve un cursor y sólo los campos comerciales necesarios", async () => {
    const findMany = jest.fn().mockResolvedValue(Array.from({ length: 21 }, (_, i) => ({ id: `product-${i}`, name: "Raqueta", sku: `SKU-${i}`, price: "20" })));
    const service = new SalesService({ product: { findMany } } as never);
    const first = await service.productOptions({ search: "Raqueta", limit: 20 });
    expect(first.data).toHaveLength(20);
    expect(first.nextCursor).toBe("product-19");
    await service.productOptions({ search: "Raqueta", limit: 20, cursor: first.nextCursor! });
    expect(findMany).toHaveBeenLastCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: { gt: "product-19" }, status: "ACTIVE", archivedAt: null }),
      take: 21, select: { id: true, name: true, sku: true, price: true },
    }));
  });
  it("busca clientes por nombre, email e identidad sin cargar su historial", async () => {
    const findMany = jest.fn().mockResolvedValue([{ id: "customer-150", name: "Cliente remoto" }]);
    const service = new SalesService({ customer: { findMany } } as never);
    const result = await service.customerOptions({ search: "customer-150", limit: 20 });
    expect(result.data[0].id).toBe("customer-150");
    expect(result.nextCursor).toBeNull();
    expect(findMany.mock.calls[0][0].include).toBeUndefined();
    expect(findMany.mock.calls[0][0].where.OR).toContainEqual({ id: "customer-150" });
  });
  it("lee el estado anterior después de obtener el bloqueo", async () => {
    const events: string[] = [];
    const tx = {
      $queryRaw: jest.fn(async () => { events.push("lock"); return []; }),
      sale: {
        findUnique: jest.fn(async () => { events.push("read"); return { status: "PROCESSING" }; }),
        update: jest.fn(async () => events.push("write")),
      },
      saleStatusHistory: { create: jest.fn(async () => {}) },
    };
    await new SalesService({ $transaction: (fn: (tx: unknown) => unknown) => fn(tx) } as never).update("sale-1", { status: "SHIPPED" });
    expect(events.slice(0, 3)).toEqual(["lock", "read", "write"]);
    expect(tx.saleStatusHistory.create).toHaveBeenCalledWith({ data: { saleId: "sale-1", from: "PROCESSING", to: "SHIPPED", note: undefined } });
  });
});
