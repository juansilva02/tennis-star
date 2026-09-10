import { BadRequestException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type RankedProduct = { id: string; name: string; quantity: number; revenue: Prisma.Decimal };

@Injectable()
export class ReportingService {
  constructor(private p: PrismaService) {}
  async health() {
    try { await this.p.$queryRaw`SELECT 1`; }
    catch { throw new ServiceUnavailableException("Base de datos no disponible"); }
    return { status: "ok", timestamp: new Date().toISOString() };
  }

  private topProducts(limit: number, dates = Prisma.empty) {
    return this.p.$queryRaw<RankedProduct[]>(Prisma.sql`
      SELECT COALESCE(i."productId", 'sku:' || i."sku") AS "id",
             COALESCE(MAX(p."name"), MAX(i."productName")) AS "name",
             SUM(i."quantity")::float8 AS "quantity", SUM(i."subtotal") AS "revenue"
      FROM "SaleItem" i JOIN "Sale" s ON s."id" = i."saleId"
      LEFT JOIN "Product" p ON p."id" = i."productId"
      WHERE s."status" = 'COMPLETED' AND s."paymentStatus" = 'PAID' ${dates}
      GROUP BY COALESCE(i."productId", 'sku:' || i."sku")
      ORDER BY SUM(i."quantity") DESC, "id" ASC LIMIT ${limit}
    `);
  }

  async dashboard() {
    const [productCount, products, inventory, recentSales, completed, top] = await Promise.all([
      this.p.product.count({ where: { archivedAt: null } }),
      this.p.product.findMany({ where: { archivedAt: null }, orderBy: { createdAt: "desc" }, take: 8,
        select: { id: true, name: true, imageUrl: true, stock: true } }),
      this.p.$queryRaw<{ value: Prisma.Decimal }[]>`SELECT COALESCE(SUM("price" * "stock"), 0) AS "value" FROM "Product" WHERE "archivedAt" IS NULL`,
      this.p.sale.findMany({ where: { hiddenAt: null }, orderBy: { createdAt: "desc" }, take: 5,
        include: { customer: { select: { name: true } } } }),
      this.p.sale.aggregate({ where: { status: "COMPLETED", paymentStatus: "PAID" }, _sum: { total: true } }),
      this.topProducts(5),
    ]);
    return { productCount, products, inventoryValue: inventory[0].value, recentSales,
      revenue: completed._sum.total ?? new Prisma.Decimal(0),
      topProducts: top.map((p) => ({ productKey: p.id, productName: p.name, _sum: { quantity: p.quantity, subtotal: p.revenue } })),
    };
  }

  async statistics(from?: string, to?: string) {
    const start = from ? new Date(from) : undefined;
    const end = to ? new Date(to) : undefined;
    if ((start && !Number.isFinite(start.getTime())) || (end && !Number.isFinite(end.getTime())) || (start && end && start >= end)) {
      throw new BadRequestException("El rango de fechas es inválido");
    }
    const createdAt = { ...(start ? { gte: start } : {}), ...(end ? { lt: end } : {}) };
    const dates = Prisma.sql`${start ? Prisma.sql`AND s."createdAt" >= ${start}` : Prisma.empty} ${end ? Prisma.sql`AND s."createdAt" < ${end}` : Prisma.empty}`;
    const [paid, orders, refunded, cancelledOrders, years, trend, topProducts] = await Promise.all([
      this.p.sale.aggregate({ where: { status: "COMPLETED", paymentStatus: "PAID", createdAt }, _sum: { total: true }, _count: { _all: true } }),
      this.p.sale.count({ where: { status: "COMPLETED", createdAt } }),
      this.p.sale.aggregate({ where: { paymentStatus: "REFUNDED", createdAt }, _sum: { total: true }, _count: { _all: true } }),
      this.p.sale.count({ where: { status: "CANCELLED", createdAt } }),
      this.p.$queryRaw<{ year: number }[]>`SELECT DISTINCT EXTRACT(YEAR FROM ("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'America/Argentina/Buenos_Aires')::int AS "year" FROM "Sale" ORDER BY "year" DESC`,
      this.p.$queryRaw<{ date: string; revenue: Prisma.Decimal; orders: number }[]>(Prisma.sql`
        SELECT TO_CHAR((s."createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'America/Argentina/Buenos_Aires', 'YYYY-MM-DD') AS "date",
          SUM(s."total") AS "revenue", COUNT(*)::int AS "orders"
        FROM "Sale" s WHERE s."status" = 'COMPLETED' AND s."paymentStatus" = 'PAID' ${dates}
        GROUP BY "date" ORDER BY "date" ASC
      `),
      this.topProducts(8, dates),
    ]);
    const revenue = paid._sum.total ?? new Prisma.Decimal(0);
    return { availableYears: years.map((row) => row.year), revenue, orders,
      paidOrders: paid._count._all, refundedOrders: refunded._count._all,
      refundedTotal: refunded._sum.total ?? new Prisma.Decimal(0), cancelledOrders,
      averageTicket: paid._count._all ? revenue.div(paid._count._all) : new Prisma.Decimal(0),
      trend, topProducts,
    };
  }
}
