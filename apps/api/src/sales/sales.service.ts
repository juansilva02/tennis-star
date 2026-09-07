import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { argentinaDayRange } from "../common/argentina-time";
import { pageArgs, paged } from "../common/http";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSaleDto, UpdateSaleDto } from "./sales.dto";

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async todaySummary(now = new Date()) {
    const { from, to } = argentinaDayRange(now);
    const where: Prisma.SaleWhereInput = { createdAt: { gte: from, lt: to } };
    const [count, amounts] = await Promise.all([
      this.prisma.sale.count({ where }),
      this.prisma.sale.aggregate({ where, _sum: { total: true } }),
    ]);
    return {
      count,
      total: amounts._sum.total ?? new Prisma.Decimal(0),
      from: from.toISOString(),
      to: to.toISOString(),
    };
  }

  async list(q: any) {
    const { page, pageSize, skip } = pageArgs(q);
    const where: Prisma.SaleWhereInput = {
      hiddenAt: q.hidden === "true" ? { not: null } : null,
      ...(q.status ? { status: q.status } : {}),
      ...(q.search
        ? {
            OR: [
              { orderNumber: { contains: q.search, mode: "insensitive" } },
              {
                customer: { name: { contains: q.search, mode: "insensitive" } },
              },
            ],
          }
        : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          customer: true,
          items: true,
          history: { orderBy: { createdAt: "desc" } },
        },
      }),
      this.prisma.sale.count({ where }),
    ]);
    return paged(data, total, page, pageSize);
  }
  async create(dto: CreateSaleDto) {
    if (!dto.items.length)
      throw new BadRequestException("Agregue al menos un producto");
    const ids = [...new Set(dto.items.map((i) => i.productId))];
    return this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: ids }, archivedAt: null },
      });
      if (products.length !== ids.length)
        throw new BadRequestException(
          "Uno o más productos no están disponibles",
        );

      const byId = new Map(products.map((product) => [product.id, product]));
      let total = new Prisma.Decimal(0);
      const items = dto.items.map((item) => {
        const product = byId.get(item.productId)!;
        const subtotal = product.price.mul(item.quantity);
        total = total.add(subtotal);
        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unitPrice: product.price,
          quantity: item.quantity,
          subtotal,
        };
      });
      const settings = await tx.storeSettings.findUnique({
        where: { id: "default" },
      });
      const orderNumber = `${settings?.orderPrefix ?? "TS"}-${new Date().getFullYear()}-${randomUUID().slice(0, 6).toUpperCase()}`;

      return tx.sale.create({
        data: {
          orderNumber,
          customerId: dto.customerId,
          paymentMethod: dto.paymentMethod,
          paymentStatus: dto.paymentStatus ?? "UNPAID",
          shippingAddress: dto.shippingAddress,
          notes: dto.notes,
          total,
          items: { create: items },
          history: { create: { to: "PENDING", note: "Pedido creado" } },
        },
        include: { customer: true, items: true, history: true },
      });
    });
  }
  async update(id: string, dto: UpdateSaleDto) {
    const current = await this.prisma.sale.findUnique({ where: { id } });
    if (!current) throw new NotFoundException();
    const { statusNote, status, ...data } = dto;
    return this.prisma.$transaction(async (tx) => {
      await tx.sale.update({
        where: { id },
        data: { ...data, ...(status ? { status } : {}) },
      });
      if (status && status !== current.status)
        await tx.saleStatusHistory.create({
          data: {
            saleId: id,
            from: current.status,
            to: status,
            note: statusNote,
          },
        });
      return tx.sale.findUnique({
        where: { id },
        include: {
          customer: true,
          items: true,
          history: { orderBy: { createdAt: "desc" } },
        },
      });
    });
  }
  hide(id: string, restore = false) {
    return this.prisma.sale.update({
      where: { id },
      data: { hiddenAt: restore ? null : new Date() },
    });
  }
}
