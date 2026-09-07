import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { argentinaDateKey, argentinaYear } from "../common/argentina-time";
import { PrismaService } from "../prisma/prisma.service";
import { DiscountDto, NotificationDto, SettingsDto } from "./admin.dto";

@Injectable()
export class AdminService {
  constructor(private p: PrismaService) {}
  discounts(q: any) {
    return this.p.discount
      .findMany({
        where: q.search
          ? {
              OR: [
                { name: { contains: q.search, mode: "insensitive" } },
                { code: { contains: q.search, mode: "insensitive" } },
              ],
            }
          : {},
        orderBy: { createdAt: "desc" },
      })
      .then((data) => ({
        data,
        meta: {
          total: data.length,
          page: 1,
          pageSize: data.length,
          pageCount: 1,
        },
      }));
  }
  createDiscount(d: DiscountDto) {
    return this.p.discount.create({
      data: {
        ...d,
        code: d.code.toUpperCase(),
        value: new Prisma.Decimal(d.value),
        startsAt: d.startsAt ? new Date(d.startsAt) : null,
        endsAt: d.endsAt ? new Date(d.endsAt) : null,
      },
    });
  }
  updateDiscount(id: string, d: Partial<DiscountDto>) {
    const { value, startsAt, endsAt, ...rest } = d;
    return this.p.discount.update({
      where: { id },
      data: {
        ...rest,
        ...(value !== undefined ? { value: new Prisma.Decimal(value) } : {}),
        ...(startsAt !== undefined
          ? { startsAt: startsAt ? new Date(startsAt) : null }
          : {}),
        ...(endsAt !== undefined
          ? { endsAt: endsAt ? new Date(endsAt) : null }
          : {}),
      },
    });
  }
  deleteDiscount(id: string) {
    return this.p.discount.delete({ where: { id } });
  }
  notifications(q: any) {
    return this.p.notification
      .findMany({
        where: q.unread === "true" ? { readAt: null } : {},
        orderBy: { createdAt: "desc" },
      })
      .then((data) => ({
        data,
        meta: {
          total: data.length,
          page: 1,
          pageSize: data.length,
          pageCount: 1,
        },
      }));
  }
  createNotification(d: NotificationDto) {
    return this.p.notification.create({ data: d });
  }
  readNotification(id: string, read = true) {
    return this.p.notification.update({
      where: { id },
      data: { readAt: read ? new Date() : null },
    });
  }
  readAll() {
    return this.p.notification.updateMany({
      where: { readAt: null },
      data: { readAt: new Date() },
    });
  }
  deleteNotification(id: string) {
    return this.p.notification.delete({ where: { id } });
  }
  settings() {
    return this.p.storeSettings.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default", supportEmail: "hola@tennisstar.com" },
    });
  }
  saveSettings(d: SettingsDto) {
    return this.p.storeSettings.upsert({
      where: { id: "default" },
      update: d,
      create: { id: "default", ...d },
    });
  }
  async dashboard() {
    const [
      productCount,
      products,
      allProducts,
      recentSales,
      completed,
      topRaw,
    ] = await Promise.all([
      this.p.product.count({ where: { archivedAt: null } }),
      this.p.product.findMany({
        where: { archivedAt: null },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { category: true, brand: true },
      }),
      this.p.product.findMany({
        where: { archivedAt: null },
        select: { price: true, stock: true },
      }),
      this.p.sale.findMany({
        where: { hiddenAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { customer: true },
      }),
      this.p.sale.findMany({
        where: { status: "COMPLETED", paymentStatus: "PAID" },
      }),
      this.p.saleItem.groupBy({
        by: ["productName"],
        where: { sale: { status: "COMPLETED", paymentStatus: "PAID" } },
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);
    const inventoryValue = allProducts.reduce(
      (sum, p) => sum.add(p.price.mul(p.stock)),
      new Prisma.Decimal(0),
    );
    return {
      productCount,
      inventoryValue,
      products,
      recentSales,
      topProducts: topRaw,
      revenue: completed.reduce(
        (s, v) => s.add(v.total),
        new Prisma.Decimal(0),
      ),
    };
  }
  async statistics(from?: string, to?: string) {
    const dateFilter = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lt: new Date(to) } : {}),
    };
    const paidWhere: Prisma.SaleWhereInput = {
      status: "COMPLETED",
      paymentStatus: "PAID",
      createdAt: dateFilter,
    };
    const [sales, completedOrders, refundedSales, cancelledOrders, availableDates] =
      await Promise.all([
      this.p.sale.findMany({
        where: paidWhere,
        include: { items: true },
        orderBy: { createdAt: "asc" },
      }),
      this.p.sale.count({
        where: { status: "COMPLETED", createdAt: dateFilter },
      }),
      this.p.sale.findMany({
        where: { paymentStatus: "REFUNDED", createdAt: dateFilter },
        select: { total: true },
      }),
      this.p.sale.count({
        where: { status: "CANCELLED", createdAt: dateFilter },
      }),
      this.p.sale.findMany({
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    const revenue = sales.reduce(
      (s, v) => s.add(v.total),
      new Prisma.Decimal(0),
    );
    const trend = new Map<
      string,
      { date: string; revenue: number; orders: number }
    >();
    const products = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();
    for (const sale of sales) {
      const date = argentinaDateKey(sale.createdAt);
      const t = trend.get(date) ?? { date, revenue: 0, orders: 0 };
      t.revenue += sale.total.toNumber();
      t.orders++;
      trend.set(date, t);
      for (const i of sale.items) {
        const p = products.get(i.productName) ?? {
          name: i.productName,
          quantity: 0,
          revenue: 0,
        };
        p.quantity += i.quantity;
        p.revenue += i.subtotal.toNumber();
        products.set(i.productName, p);
      }
    }
    const refundedTotal = refundedSales.reduce(
      (sum, sale) => sum.add(sale.total),
      new Prisma.Decimal(0),
    );
    return {
      availableYears: [
        ...new Set(availableDates.map((sale) => argentinaYear(sale.createdAt))),
      ],
      revenue,
      orders: completedOrders,
      paidOrders: sales.length,
      refundedOrders: refundedSales.length,
      refundedTotal,
      cancelledOrders,
      averageTicket: sales.length ? revenue.div(sales.length) : 0,
      trend: [...trend.values()],
      topProducts: [...products.values()]
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 8),
    };
  }
}
