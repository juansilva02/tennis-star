import { BadRequestException, Injectable } from "@nestjs/common";
import { pageArgs, paged } from "../common/http";
import { discountDate } from "../common/discount-dates";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { DiscountDto, NotificationDto, SettingsDto } from "./admin.dto";

@Injectable()
export class AdminService {
  constructor(private p: PrismaService) {}
  async discounts(q: any) {
    const { page, pageSize, skip } = pageArgs(q);
    const where: Prisma.DiscountWhereInput = q.search ? { OR: [{ name: { contains: q.search, mode: "insensitive" } }, { code: { contains: q.search, mode: "insensitive" } }] } : {};
    const [data, total] = await Promise.all([
      this.p.discount.findMany({ where, skip, take: pageSize, orderBy: [{ createdAt: "desc" }, { id: "desc" }] }),
      this.p.discount.count({ where }),
    ]);
    return paged(data, total, page, pageSize);
  }
  createDiscount(d: DiscountDto) {
    this.validateDiscount(d);
    return this.p.discount.create({
      data: {
        ...d,
        code: d.code.trim().toUpperCase(),
        value: new Prisma.Decimal(d.value),
        startsAt: discountDate(d.startsAt),
        endsAt: discountDate(d.endsAt, true),
      },
    });
  }
  async updateDiscount(id: string, d: Partial<DiscountDto>) {
    const current = await this.p.discount.findUniqueOrThrow({ where: { id } });
    this.validateDiscount({ ...current, ...d });
    const { code, value, startsAt, endsAt, ...rest } = d;
    return this.p.discount.update({
      where: { id },
      data: {
        ...rest,
        ...(code !== undefined ? { code: code.trim().toUpperCase() } : {}),
        ...(value !== undefined ? { value: new Prisma.Decimal(value) } : {}),
        ...(startsAt !== undefined
          ? { startsAt: discountDate(startsAt) }
          : {}),
        ...(endsAt !== undefined
          ? { endsAt: discountDate(endsAt, true) }
          : {}),
      },
    });
  }
  private validateDiscount(d: { type: string; value: number | Prisma.Decimal; startsAt?: string | Date | null; endsAt?: string | Date | null }) {
    const startsAt = d.startsAt instanceof Date ? d.startsAt : discountDate(d.startsAt);
    const endsAt = d.endsAt instanceof Date ? d.endsAt : discountDate(d.endsAt, true);
    if (d.type === "PERCENTAGE" && Number(d.value) > 100) throw new BadRequestException("El porcentaje no puede superar 100");
    if (startsAt && endsAt && endsAt < startsAt) throw new BadRequestException("La fecha final debe ser posterior al comienzo");
  }
  deleteDiscount(id: string) {
    return this.p.discount.delete({ where: { id } });
  }
  async notifications(q: any) {
    const { page, pageSize, skip } = pageArgs(q);
    const where = q.unread === "true" ? { readAt: null } : {};
    const [data, total] = await Promise.all([
      this.p.notification.findMany({ where, skip, take: pageSize, orderBy: [{ createdAt: "desc" }, { id: "desc" }] }),
      this.p.notification.count({ where }),
    ]);
    return paged(data, total, page, pageSize);
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
}
