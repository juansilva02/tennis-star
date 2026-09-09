import {
  PrismaClient,
  Gender,
  ProductStatus,
  SaleStatus,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";
import { hash } from "argon2";
import "dotenv/config";

const prisma = new PrismaClient();
const images = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1605408499391-6368c628ef42?auto=format&fit=crop&w=900&q=80",
];

function requireEnvironmentVariable(name: "ADMIN_EMAIL" | "ADMIN_PASSWORD") {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Falta ${name}. Definila en el entorno antes de ejecutar el seed.`,
    );
  }
  return value;
}

async function main() {
  const adminEmail = requireEnvironmentVariable("ADMIN_EMAIL");
  const adminPassword = requireEnvironmentVariable("ADMIN_PASSWORD");
  const passwordHash = await hash(adminPassword);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      name: "Administrador",
      email: adminEmail,
      passwordHash,
    },
  });
  const categoryNames = ["Calzado", "Raquetas", "Indumentaria", "Accesorios"];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name, description: `Colección de ${name.toLowerCase()}` },
      }),
    ),
  );
  const brandNames = ["Adidas", "Nike", "Wilson", "Babolat"];
  const brands = await Promise.all(
    brandNames.map((name) =>
      prisma.brand.upsert({
        where: { name },
        update: {},
        create: { name, description: `${name} Tennis` },
      }),
    ),
  );
  const productSeeds = [
    ["TS-AD-001", "Adidas CourtJam Control", "89.00", 12, 0, 0],
    ["TS-NK-002", "NikeCourt Air Zoom Vapor", "129.00", 8, 0, 1],
    ["TS-WL-003", "Wilson Pro Staff 97", "279.00", 5, 1, 2],
    ["TS-BB-004", "Babolat Pure Aero", "249.00", 7, 1, 3],
    ["TS-AD-005", "Remera Club Tennis", "42.00", 22, 2, 0],
    ["TS-NK-006", "Short NikeCourt Dri-FIT", "55.00", 18, 2, 1],
    ["TS-WL-007", "Bolso Wilson Super Tour", "74.00", 9, 3, 2],
    ["TS-BB-008", "Overgrip Babolat Pro", "12.00", 34, 3, 3],
  ] as const;
  const products: any[] = [];
  for (let i = 0; i < productSeeds.length; i++) {
    const [sku, name, price, stock, ci, bi] = productSeeds[i];
    products.push(
      await prisma.product.upsert({
        where: { sku },
        update: {},
        create: {
          sku,
          name,
          price,
          stock,
          description: `${name}, seleccionado para jugadores que buscan rendimiento y comodidad.`,
          gender: i % 3 === 0 ? Gender.WOMEN : Gender.UNISEX,
          status: ProductStatus.ACTIVE,
          imageUrl: images[i % images.length],
          images: {
            create: {
              url: images[i % images.length],
              altText: name,
              isPrimary: true,
            },
          },
          categoryId: categories[ci].id,
          brandId: brands[bi].id,
          options: {
            create: [
              {
                name: "Color",
                values: { create: [{ value: "Negro" }, { value: "Blanco" }] },
              },
              {
                name: "Talla",
                values: { create: ["S", "M", "L"].map((value) => ({ value })) },
              },
            ],
          },
        },
      }),
    );
  }
  const membershipData = [
    {
      name: "Club",
      price: "0",
      description: "Acceso a beneficios básicos",
      benefits: ["Novedades anticipadas"],
    },
    {
      name: "Pro",
      price: "12",
      description: "Para jugadores frecuentes",
      benefits: ["Envíos sin cargo", "Soporte prioritario"],
    },
    {
      name: "Elite",
      price: "25",
      description: "La experiencia completa",
      benefits: [
        "Eventos exclusivos",
        "Envíos sin cargo",
        "Soporte prioritario",
      ],
    },
  ];
  const memberships: any[] = [];
  for (const m of membershipData)
    memberships.push(
      await prisma.membership.upsert({
        where: { name: m.name },
        update: {},
        create: m,
      }),
    );
  const customerData = [
    ["Santiago Pérez", "santiago@example.com", memberships[1].id],
    ["Jaime González Correa", "jaime@example.com", memberships[2].id],
    ["Valentina Ruiz", "valentina@example.com", memberships[0].id],
    ["Martín López", "martin@example.com", memberships[1].id],
  ];
  const customers: any[] = [];
  for (const [name, email, membershipId] of customerData)
    customers.push(
      await prisma.customer.upsert({
        where: { email },
        update: {},
        create: {
          name,
          email,
          phone: "+54 11 5555-0101",
          address: "Av. del Libertador 1234",
          city: "Buenos Aires",
          postalCode: "C1425",
          membershipId,
          loyalty: {
            create: { points: 120, reason: "Saldo inicial de demostración" },
          },
        },
      }),
    );
  await prisma.discount.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      name: "Bienvenida",
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      active: true,
    },
  });
  await prisma.discount.upsert({
    where: { code: "COURT20" },
    update: {},
    create: {
      name: "Especial cancha",
      code: "COURT20",
      type: "FIXED",
      value: 20,
      active: true,
    },
  });
  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      storeName: "Tennis Star",
      supportEmail: "hola@tennisstar.com",
      phone: "+54 11 5555-0000",
      address: "Buenos Aires, Argentina",
      orderPrefix: "TS",
    },
  });
  if ((await prisma.sale.count()) === 0) {
    for (let n = 0; n < 5; n++) {
      const product = products[n];
      const qty = (n % 2) + 1;
      const total = product.price.mul(qty);
      const status = [
        SaleStatus.COMPLETED,
        SaleStatus.SHIPPED,
        SaleStatus.PROCESSING,
        SaleStatus.CANCELLED,
        SaleStatus.PENDING,
      ][n];
      await prisma.sale.create({
        data: {
          orderNumber: `TS-2026-${String(n + 1).padStart(4, "0")}`,
          customerId: customers[n % customers.length].id,
          status,
          paymentStatus:
            status === SaleStatus.CANCELLED
              ? PaymentStatus.REFUNDED
              : PaymentStatus.PAID,
          paymentMethod: PaymentMethod.CREDIT_CARD,
          subtotal: total,
          total,
          shippingAddress: "Av. del Libertador 1234, Buenos Aires",
          items: {
            create: {
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              unitPrice: product.price,
              quantity: qty,
              subtotal: total,
            },
          },
          history: {
            create: [
              { to: SaleStatus.PENDING, note: "Pedido creado" },
              ...(status !== SaleStatus.PENDING
                ? [
                    {
                      from: SaleStatus.PENDING,
                      to: status,
                      note: "Actualización de demostración",
                    },
                  ]
                : []),
            ],
          },
        },
      });
    }
  }
  const notes = [
    [
      "Nueva venta registrada",
      "Se registró una venta desde el panel.",
      "ORDER",
    ],
    [
      "Importación disponible",
      "Podés importar productos desde un archivo CSV.",
      "INFO",
    ],
    [
      "Objetivo alcanzado",
      "Las ventas de la semana superaron el objetivo.",
      "SUCCESS",
    ],
  ];
  if ((await prisma.notification.count()) === 0)
    for (const [title, message, type] of notes)
      await prisma.notification.create({
        data: { title, message, type: type as any },
      });
}
main()
  .then(() => console.log("Seed de Tennis Star completado"))
  .finally(() => prisma.$disconnect());
