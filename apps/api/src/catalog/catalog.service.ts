import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { pageArgs, paged } from "../common/http";
import { CatalogDto, ProductDto } from "./catalog.dto";
import { ProductImageUploadDto } from "./catalog.dto";
import { ImageStorageService } from "../uploads/image-storage.service";

@Injectable()
export class CatalogService {
  constructor(
    private prisma: PrismaService,
    private imageStorage: ImageStorageService,
  ) {}
  async listCatalog(kind: "category" | "brand", q: any) {
    const { page, pageSize, skip } = pageArgs(q);
    const model: any = this.prisma[kind];
    const where = q.search
      ? { name: { contains: q.search, mode: "insensitive" } }
      : {};
    const [data, total] = await Promise.all([
      model.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          [q.sortBy || "name"]: q.sortOrder === "desc" ? "desc" : "asc",
        },
        include: { _count: { select: { products: true } } },
      }),
      model.count({ where }),
    ]);
    return paged(data, total, page, pageSize);
  }
  createCatalog(kind: "category" | "brand", dto: CatalogDto) {
    return (this.prisma[kind] as any).create({ data: dto });
  }
  async updateCatalog(
    kind: "category" | "brand",
    id: string,
    dto: Partial<CatalogDto>,
  ) {
    try {
      return await (this.prisma[kind] as any).update({
        where: { id },
        data: dto,
      });
    } catch {
      throw new NotFoundException("Registro no encontrado");
    }
  }
  async deleteCatalog(kind: "category" | "brand", id: string) {
    const model: any = this.prisma[kind];
    const record = await model.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!record) throw new NotFoundException();
    if (record._count.products)
      throw new ConflictException(
        "No se puede eliminar porque tiene productos relacionados",
      );
    await model.delete({ where: { id } });
    return { id };
  }
  async products(q: any) {
    const { page, pageSize, skip } = pageArgs(q);
    const where: Prisma.ProductWhereInput = {
      archivedAt: q.archived === "true" ? { not: null } : null,
      ...(q.search
        ? {
            OR: ["name", "sku", "id"].map((field) => ({
              [field]: { contains: q.search, mode: "insensitive" },
            })),
          }
        : {}),
      ...(q.categoryId ? { categoryId: q.categoryId } : {}),
      ...(q.brandId ? { brandId: q.brandId } : {}),
      ...(q.status ? { status: q.status } : {}),
      ...(q.gender ? { gender: q.gender } : {}),
    };
    const orderBy: any = {
      [q.sortBy || "createdAt"]: q.sortOrder === "asc" ? "asc" : "desc",
    };
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          category: true,
          brand: true,
          options: { include: { values: true } },
          images: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);
    return paged(data, total, page, pageSize);
  }
  private optionCreate(options: ProductDto["options"]) {
    return (
      options?.map((o) => ({
        name: o.name,
        values: {
          create: o.values.filter(Boolean).map((value) => ({ value })),
        },
      })) ?? []
    );
  }
  createProduct(dto: ProductDto) {
    const { options, ...data } = dto;
    return this.prisma.product.create({
      data: {
        ...data,
        price: new Prisma.Decimal(data.price),
        options: { create: this.optionCreate(options) },
      },
      include: {
        category: true,
        brand: true,
        options: { include: { values: true } },
        images: true,
      },
    });
  }
  async updateProduct(id: string, dto: Partial<ProductDto>) {
    const { options, price, ...data } = dto;
    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(price !== undefined ? { price: new Prisma.Decimal(price) } : {}),
        ...(options
          ? { options: { deleteMany: {}, create: this.optionCreate(options) } }
          : {}),
      },
      include: {
        category: true,
        brand: true,
        options: { include: { values: true } },
        images: true,
      },
    });
  }
  archiveProduct(id: string, restore = false) {
    return this.prisma.product.update({
      where: { id },
      data: { archivedAt: restore ? null : new Date() },
    });
  }
  async importProducts(rows: ProductDto[]) {
    if (!rows.length)
      throw new BadRequestException("El archivo no contiene productos");
    try {
      return await this.prisma.$transaction(
        rows.map((dto) => {
          const { options, ...data } = dto;
          return this.prisma.product.create({
            data: {
              ...data,
              price: new Prisma.Decimal(data.price),
              options: { create: this.optionCreate(options) },
            },
          });
        }),
      );
    } catch {
      throw new ConflictException(
        "La importación contiene SKU duplicados o relaciones inválidas",
      );
    }
  }

  async storeProductImage(dto: ProductImageUploadDto, buffer: Buffer) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      select: { id: true, sku: true, name: true },
    });
    if (!product) throw new NotFoundException("Producto no encontrado");

    const url = await this.imageStorage.storeWebp(buffer, product.sku);
    const isPrimary = dto.isPrimary !== false;
    try {
      return await this.prisma.$transaction(async (transaction) => {
        if (isPrimary) {
          await transaction.productImage.updateMany({
            where: { productId: product.id, isPrimary: true },
            data: { isPrimary: false },
          });
        }
        const image = await transaction.productImage.create({
          data: {
            productId: product.id,
            url,
            altText: dto.altText?.trim() || product.name,
            isPrimary,
          },
        });
        if (isPrimary) {
          await transaction.product.update({
            where: { id: product.id },
            data: { imageUrl: url },
          });
        }
        return image;
      });
    } catch (error) {
      await this.imageStorage.remove(url);
      throw error;
    }
  }
}
