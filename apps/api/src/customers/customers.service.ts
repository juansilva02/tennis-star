import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { pageArgs, paged } from "../common/http";
import { PrismaService } from "../prisma/prisma.service";
import { CustomerDto, LoyaltyDto, MembershipDto } from "./customers.dto";

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}
  async list(q: any) {
    const { page, pageSize, skip } = pageArgs(q);
    const where: Prisma.CustomerWhereInput = {
      archivedAt: q.archived === "true" ? { not: null } : null,
      ...(q.search
        ? {
            OR: [
              { name: { contains: q.search, mode: "insensitive" } },
              { email: { contains: q.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          membership: true,
          loyalty: true,
          _count: { select: { sales: true } },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);
    return paged(
      rows.map((r) => ({
        ...r,
        points: r.loyalty.reduce((sum, t) => sum + t.points, 0),
      })),
      total,
      page,
      pageSize,
    );
  }
  create(dto: CustomerDto) {
    return this.prisma.customer.create({
      data: { ...dto, membershipId: dto.membershipId || null },
    });
  }
  update(id: string, dto: Partial<CustomerDto>) {
    return this.prisma.customer.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.membershipId !== undefined
          ? { membershipId: dto.membershipId || null }
          : {}),
      },
    });
  }
  archive(id: string, restore = false) {
    return this.prisma.customer.update({
      where: { id },
      data: { archivedAt: restore ? null : new Date() },
    });
  }
  addPoints(id: string, dto: LoyaltyDto) {
    return this.prisma.loyaltyTransaction.create({
      data: { customerId: id, ...dto },
    });
  }
  loyalty(q: any) {
    return this.prisma.customer
      .findMany({
        where: {
          archivedAt: null,
          ...(q.search
            ? { name: { contains: q.search, mode: "insensitive" } }
            : {}),
        },
        include: { loyalty: { orderBy: { createdAt: "desc" } } },
        orderBy: { name: "asc" },
      })
      .then((data) => ({
        data: data.map((c) => ({
          ...c,
          points: c.loyalty.reduce((s, t) => s + t.points, 0),
        })),
        meta: {
          total: data.length,
          page: 1,
          pageSize: data.length,
          pageCount: 1,
        },
      }));
  }
  memberships(q: any) {
    return this.prisma.membership
      .findMany({
        where: q.search
          ? { name: { contains: q.search, mode: "insensitive" } }
          : {},
        include: { _count: { select: { customers: true } } },
        orderBy: { name: "asc" },
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
  createMembership(dto: MembershipDto) {
    return this.prisma.membership.create({
      data: { ...dto, price: new Prisma.Decimal(dto.price) },
    });
  }
  updateMembership(id: string, dto: Partial<MembershipDto>) {
    const { price, ...rest } = dto;
    return this.prisma.membership.update({
      where: { id },
      data: {
        ...rest,
        ...(price !== undefined ? { price: new Prisma.Decimal(price) } : {}),
      },
    });
  }
  async deleteMembership(id: string) {
    await this.prisma.customer.updateMany({
      where: { membershipId: id },
      data: { membershipId: null },
    });
    return this.prisma.membership.delete({ where: { id } });
  }
}
