import { PrismaClient } from "@prisma/client";

export async function cleanupE2eArtifacts() {
  const prisma = new PrismaClient();
  try {
    const sales = await prisma.sale.deleteMany({
      where: { notes: { startsWith: "E2E Playwright" } },
    });
    const products = await prisma.product.deleteMany({
      where: {
        OR: [
          { sku: { startsWith: "E2E-" } },
          { sku: { startsWith: "REL-" } },
          { sku: { startsWith: "ROLLBACK-" } },
          { name: "Producto E2E" },
        ],
      },
    });
    const categories = await prisma.category.deleteMany({
      where: {
        name: { startsWith: "Categoría E2E" },
        products: { none: {} },
      },
    });
    const brands = await prisma.brand.deleteMany({
      where: {
        name: { startsWith: "Marca E2E" },
        products: { none: {} },
      },
    });
    return {
      sales: sales.count,
      products: products.count,
      categories: categories.count,
      brands: brands.count,
    };
  } finally {
    await prisma.$disconnect();
  }
}
