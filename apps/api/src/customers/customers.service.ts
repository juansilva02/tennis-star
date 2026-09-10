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
          _count: { select: { sales: true } },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);
    const balances = await this.prisma.loyaltyTransaction.groupBy({ by: ["customerId"], where: { customerId: { in: rows.map((row) => row.id) } }, _sum: { points: true } });
    const points = new Map(balances.map((balance) => [balance.customerId, balance._sum.points ?? 0]));
    return paged(
      rows.map((r) => ({
        ...r,
        points: points.get(r.id) ?? 0,
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
  async loyalty(q: any) {
    const { page, pageSize, skip } = pageArgs(q);
    const term = q.search || "";
    const search = term ? Prisma.sql`AND (c."name" ILIKE ${'%' + term + '%'} OR c."email" ILIKE ${'%' + term + '%'})` : Prisma.empty;
    const direction = q.sortOrder === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`;
    const [data, total] = await Promise.all([
      this.prisma.$queryRaw<{ id: string; name: string; email: string; points: number }[]>(Prisma.sql`
        SELECT c."id", c."name", c."email", COALESCE(SUM(l."points"), 0)::float8 AS "points"
        FROM "Customer" c LEFT JOIN "LoyaltyTransaction" l ON l."customerId" = c."id"
        WHERE c."archivedAt" IS NULL ${search}
        GROUP BY c."id" ORDER BY "points" ${direction}, c."id" ASC LIMIT ${pageSize} OFFSET ${skip}
      `),
      this.prisma.customer.count({ where: { archivedAt: null, ...(term ? { OR: [{ name: { contains: term, mode: "insensitive" as const } }, { email: { contains: term, mode: "insensitive" as const } }] } : {}) } }),
    ]);
    return paged(data, total, page, pageSize);
  }
  async memberships(q: any) {
    const { page, pageSize, skip } = pageArgs(q);
    const where: Prisma.MembershipWhereInput = q.search ? { name: { contains: q.search, mode: "insensitive" } } : {};
    const [data, total] = await Promise.all([
      this.prisma.membership.findMany({ where, skip, take: pageSize, include: { _count: { select: { customers: true } } }, orderBy: { name: "asc" } }),
      this.prisma.membership.count({ where }),
    ]);
    return paged(data, total, page, pageSize);
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
    return this.prisma.membership.delete({ where: { id } });
  }
}
