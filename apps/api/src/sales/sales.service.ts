import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Discount, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { argentinaDayRange } from "../common/argentina-time";
import { pageArgs, paged } from "../common/http";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateSaleDto,
  PreviewSaleDiscountDto,
  UpdateSaleDto,
  SaleOptionsQueryDto,
} from "./sales.dto";

type PricedSale = {
  subtotal: Prisma.Decimal;
  items: {
    productId: string;
    productName: string;
    sku: string;
    unitPrice: Prisma.Decimal;
    quantity: number;
    subtotal: Prisma.Decimal;
  }[];
};

export function discountAmountFor(
  discount: Pick<Discount, "type" | "value">,
  subtotal: Prisma.Decimal,
) {
  const amount =
    discount.type === "PERCENTAGE"
      ? subtotal.mul(discount.value).div(100).toDecimalPlaces(2)
      : discount.value;
  return amount.greaterThan(subtotal) ? subtotal : amount;
}

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async customerOptions(q: SaleOptionsQueryDto) {
    const search = q.search?.trim();
    const data = await this.prisma.customer.findMany({
      where: {
        archivedAt: null,
        ...(q.cursor ? { id: { gt: q.cursor } } : {}),
        ...(search ? { OR: [
          { id: search },
          ...["name", "email", "address", "city", "postalCode"].map((field) => ({
            [field]: { contains: search, mode: "insensitive" },
          })),
        ] } : {}),
      },
      select: { id: true, name: true, email: true, address: true, city: true, postalCode: true },
      orderBy: { id: "asc" },
      take: q.limit + 1,
    });
    return this.optionPage(data, q.limit);
  }

  async productOptions(q: SaleOptionsQueryDto) {
    const search = q.search?.trim();
    const data = await this.prisma.product.findMany({
      where: {
        archivedAt: null, status: "ACTIVE",
        ...(q.cursor ? { id: { gt: q.cursor } } : {}),
        ...(search ? { OR: [
          { id: search },
          { name: { contains: search, mode: "insensitive" } },
          { sku: { contains: search, mode: "insensitive" } },
        ] } : {}),
      },
      select: { id: true, name: true, sku: true, price: true },
      orderBy: { id: "asc" },
      take: q.limit + 1,
    });
    return this.optionPage(data, q.limit);
  }

  private optionPage<T extends { id: string }>(rows: T[], limit: number) {
    const data = rows.slice(0, limit);
    return { data, nextCursor: rows.length > limit ? data.at(-1)!.id : null };
  }

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
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: {
          customer: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.sale.count({ where }),
    ]);
    return paged(data, total, page, pageSize);
  }

  async detail(id: string) {
    const sale = await this.prisma.sale.findUnique({ where: { id }, include: {
      customer: true, items: true, history: { orderBy: { createdAt: "desc" } },
    } });
    if (!sale) throw new NotFoundException("Pedido no encontrado");
    return sale;
  }

  private async priceItems(
    tx: Prisma.TransactionClient,
    requestedItems: CreateSaleDto["items"],
  ): Promise<PricedSale> {
    if (!requestedItems.length)
      throw new BadRequestException("Agregue al menos un producto");
    const ids = [...new Set(requestedItems.map((item) => item.productId))];
    const products = await tx.product.findMany({
      where: { id: { in: ids }, archivedAt: null },
    });
    if (products.length !== ids.length)
      throw new BadRequestException("Uno o más productos no están disponibles");

    const byId = new Map(products.map((product) => [product.id, product]));
    let subtotal = new Prisma.Decimal(0);
    const items = requestedItems.map((item) => {
      const product = byId.get(item.productId)!;
      const itemSubtotal = product.price.mul(item.quantity);
      subtotal = subtotal.add(itemSubtotal);
      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      };
    });
    return { subtotal, items };
  }

  private async availableDiscount(
    tx: Prisma.TransactionClient,
    rawCode: string,
    now = new Date(),
  ) {
    const code = rawCode.trim().toUpperCase();
    const discount = await tx.discount.findUnique({ where: { code } });
    if (!discount)
      throw new BadRequestException("El código de descuento no existe");
    if (!discount.active)
      throw new BadRequestException("El código de descuento no está activo");
    if (discount.startsAt && discount.startsAt > now)
      throw new BadRequestException(
        "El código de descuento todavía no está vigente",
      );
    if (discount.endsAt && discount.endsAt < now)
      throw new BadRequestException("El código de descuento está vencido");
    if (discount.value.lessThan(0))
      throw new BadRequestException("El descuento tiene una configuración inválida");
    if (discount.type === "PERCENTAGE" && discount.value.greaterThan(100))
      throw new BadRequestException(
        "El descuento tiene una configuración inválida",
      );
    return discount;
  }

  async previewDiscount(dto: PreviewSaleDiscountDto) {
    return this.prisma.$transaction(async (tx) => {
      const { subtotal } = await this.priceItems(tx, dto.items);
      const discount = await this.availableDiscount(tx, dto.discountCode);
      const discountAmount = discountAmountFor(discount, subtotal);
      return {
        code: discount.code,
        name: discount.name,
        type: discount.type,
        value: discount.value,
        subtotal,
        discountAmount,
        total: subtotal.sub(discountAmount),
      };
    });
  }

  async create(dto: CreateSaleDto) {
    return this.prisma.$transaction(async (tx) => {
      const { subtotal, items } = await this.priceItems(tx, dto.items);
      const discount = dto.discountCode
        ? await this.availableDiscount(tx, dto.discountCode)
        : null;
      const discountAmount = discount
        ? discountAmountFor(discount, subtotal)
        : new Prisma.Decimal(0);
      const total = subtotal.sub(discountAmount);
      const settings = await tx.storeSettings.findUnique({
        where: { id: "default" },
      });
      const orderNumber = `${settings?.orderPrefix ?? "TS"}-${new Date().getFullYear()}-${randomUUID().replaceAll("-", "").toUpperCase()}`;

      return tx.sale.create({
        data: {
          orderNumber,
          customerId: dto.customerId,
          paymentMethod: dto.paymentMethod,
          paymentStatus: dto.paymentStatus ?? "UNPAID",
          shippingAddress: dto.shippingAddress,
          notes: dto.notes,
          subtotal,
          discountId: discount?.id,
          discountCode: discount?.code,
          discountAmount,
          total,
          items: { create: items },
          history: { create: { to: "PENDING", note: "Pedido creado" } },
        },
        include: { customer: true, items: true, history: true },
      });
    });
  }
  async update(id: string, dto: UpdateSaleDto) {
    const { statusNote, status, ...data } = dto;
    return this.prisma.$transaction(async (tx) => {
      // Serialize writers before reading the previous status for the history.
      await tx.$queryRaw`SELECT "id" FROM "Sale" WHERE "id" = ${id} FOR UPDATE`;
      const current = await tx.sale.findUnique({ where: { id } });
      if (!current) throw new NotFoundException();
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
