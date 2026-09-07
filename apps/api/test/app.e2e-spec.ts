import { INestApplication, ValidationPipe } from "@nestjs/common";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { Test } from "@nestjs/testing";
import cookieParser = require("cookie-parser");
import request = require("supertest");
import type { Agent } from "supertest";
import { Prisma } from "@prisma/client";
const sharp: typeof import("sharp").default = require("sharp");
import "dotenv/config";
import { AppModule } from "../src/app.module";
import { cleanupE2eArtifacts } from "./cleanup-e2e-artifacts";

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error(
    "Las pruebas E2E requieren ADMIN_EMAIL y ADMIN_PASSWORD en el entorno.",
  );
}

describe("Tennis Star API (PostgreSQL)", () => {
  let app: INestApplication;
  let agent: Agent;
  let uploadDirectory: string;

  beforeAll(async () => {
    uploadDirectory = await mkdtemp(join(tmpdir(), "tennis-star-e2e-"));
    process.env.UPLOAD_DIR = uploadDirectory;
    await cleanupE2eArtifacts();
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    agent = request.agent(app.getHttpServer());
    await agent.post("/api/v1/auth/login").send({
      email: adminEmail,
      password: adminPassword,
      rememberMe: false,
    }).expect(200);
  });

  afterAll(async () => {
    await app.close();
    await cleanupE2eArtifacts();
    sharp.cache(false);
    await rm(uploadDirectory, { recursive: true, force: true });
  });

  it("autentica por cookie y devuelve el usuario actual", async () => {
    const response = await agent.get("/api/v1/auth/me").expect(200);
    expect(response.body.data.email).toBe(adminEmail);
  });

  it("actualiza y elimina la foto del usuario autenticado", async () => {
    const image = await sharp({
      create: {
        width: 32,
        height: 32,
        channels: 4,
        background: { r: 30, g: 90, b: 180, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
    const uploaded = await agent
      .post("/api/v1/auth/avatar")
      .attach("file", image, { filename: "avatar.png", contentType: "image/png" })
      .expect(201);
    expect(uploaded.body.data.avatarUrl).toEqual(expect.any(String));
    expect(uploaded.body.data.avatarUrl).toMatch(/^\/uploads\/avatar-.+\.webp$/);
    const avatarPath = join(
      uploadDirectory,
      basename(uploaded.body.data.avatarUrl),
    );
    await expect(access(avatarPath)).resolves.toBeUndefined();

    const persisted = await agent.get("/api/v1/auth/me").expect(200);
    expect(persisted.body.data.avatarUrl).toBe(uploaded.body.data.avatarUrl);

    const removed = await agent.delete("/api/v1/auth/avatar").expect(200);
    expect(removed.body.data.avatarUrl).toBeNull();
    await expect(access(avatarPath)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("protege categorías relacionadas con productos", async () => {
    const suffix = Date.now();
    const category = await agent
      .post("/api/v1/categories")
      .send({ name: `Categoría E2E ${suffix}`, active: true })
      .expect(201);
    const brand = await agent
      .post("/api/v1/brands")
      .send({ name: `Marca E2E ${suffix}`, active: true })
      .expect(201);

    await agent
      .post("/api/v1/products")
      .send({
        sku: `REL-${suffix}`,
        name: "Producto relacionado",
        description: "Prueba de restricción",
        price: 10,
        stock: 1,
        gender: "UNISEX",
        status: "ACTIVE",
        categoryId: category.body.data.id,
        brandId: brand.body.data.id,
        options: [],
      })
      .expect(201);

    const blocked = await agent
      .delete(`/api/v1/categories/${category.body.data.id}`)
      .expect(409);
    expect(blocked.body.message).toContain("productos relacionados");
  });

  it("convierte y relaciona la imagen principal de un producto", async () => {
    const suffix = Date.now();
    const category = await agent
      .post("/api/v1/categories")
      .send({ name: `Categoría E2E imagen ${suffix}`, active: true })
      .expect(201);
    const brand = await agent
      .post("/api/v1/brands")
      .send({ name: `Marca E2E imagen ${suffix}`, active: true })
      .expect(201);
    const product = await agent
      .post("/api/v1/products")
      .send({
        sku: `E2E-IMG-${suffix}`,
        name: "Producto E2E con imagen",
        description: "Prueba del almacenamiento local",
        price: 25,
        stock: 1,
        gender: "UNISEX",
        status: "ACTIVE",
        categoryId: category.body.data.id,
        brandId: brand.body.data.id,
        options: [],
      })
      .expect(201);
    const png = await sharp({
      create: {
        width: 1200,
        height: 900,
        channels: 4,
        background: { r: 245, g: 245, b: 245, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const uploaded = await agent
      .post("/api/v1/uploads/products")
      .field("productId", product.body.data.id)
      .field("altText", "Producto blanco sobre fondo neutro")
      .field("isPrimary", "true")
      .attach("file", png, { filename: "producto.png", contentType: "image/png" })
      .expect(201);

    expect(uploaded.body.data).toEqual(
      expect.objectContaining({
        productId: product.body.data.id,
        altText: "Producto blanco sobre fondo neutro",
        isPrimary: true,
      }),
    );
    expect(uploaded.body.data.url).toMatch(/^\/uploads\/[a-z0-9-]+\.webp$/);
    const storedPath = join(uploadDirectory, basename(uploaded.body.data.url));
    const metadata = await sharp(await readFile(storedPath)).metadata();
    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBeLessThanOrEqual(800);

    const persisted = await agent
      .get(`/api/v1/products?search=${encodeURIComponent(product.body.data.id)}`)
      .expect(200);
    expect(persisted.body.data[0].imageUrl).toBe(uploaded.body.data.url);
    expect(persisted.body.data[0].images).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: uploaded.body.data.url, isPrimary: true }),
      ]),
    );
    await expect(access(storedPath)).resolves.toBeUndefined();
  });

  it("crea una venta con precios del servidor y snapshots", async () => {
    const customers = await agent.get("/api/v1/customers?pageSize=1").expect(200);
    const products = await agent
      .get("/api/v1/products?pageSize=1&status=ACTIVE")
      .expect(200);
    const product = products.body.data[0];

    const response = await agent
      .post("/api/v1/sales")
      .send({
        customerId: customers.body.data[0].id,
        paymentMethod: "CREDIT_CARD",
        shippingAddress: "Av. Corrientes 1234, CABA",
        items: [{ productId: product.id, quantity: 2 }],
      })
      .expect(201);

    const expected = new Prisma.Decimal(product.price).mul(2).toFixed(2);
    expect(new Prisma.Decimal(response.body.data.total).toFixed(2)).toBe(expected);
    expect(response.body.data.items[0]).toEqual(
      expect.objectContaining({
        productName: product.name,
        sku: product.sku,
        quantity: 2,
      }),
    );
  });

  it("revierte toda la importación si una fila es inválida", async () => {
    const suffix = Date.now();
    const categories = await agent.get("/api/v1/categories?pageSize=1").expect(200);
    const brands = await agent.get("/api/v1/brands?pageSize=1").expect(200);
    const sku = `ROLLBACK-${suffix}`;
    const base = {
      name: "Producto de importación",
      price: 25,
      stock: 2,
      gender: "UNISEX",
      status: "ACTIVE",
      categoryId: categories.body.data[0].id,
      brandId: brands.body.data[0].id,
      options: [],
    };

    await agent
      .post("/api/v1/products/import")
      .send([
        { ...base, sku },
        { ...base, sku: `${sku}-INVALID`, brandId: "missing-brand" },
      ])
      .expect(409);

    const search = await agent
      .get(`/api/v1/products?search=${encodeURIComponent(sku)}`)
      .expect(200);
    expect(search.body.meta.total).toBe(0);
  });

  it("expone años disponibles y acepta rangos estadísticos", async () => {
    const response = await agent
      .get(
        "/api/v1/statistics?from=2026-01-01T03%3A00%3A00.000Z&to=2027-01-01T03%3A00%3A00.000Z",
      )
      .expect(200);

    expect(response.body.data.availableYears).toEqual(
      expect.arrayContaining([expect.any(Number)]),
    );
    expect(response.body.data).toEqual(
      expect.objectContaining({
        revenue: expect.anything(),
        orders: expect.any(Number),
        trend: expect.any(Array),
      }),
    );
  });
});
