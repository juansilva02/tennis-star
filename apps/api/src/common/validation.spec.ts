import "reflect-metadata";
import { BadRequestException, ParseArrayPipe, ValidationPipe } from "@nestjs/common";
import { CatalogController } from "../catalog/catalog.controller";
import { ProductDto, UpdateProductDto } from "../catalog/catalog.dto";
import { UpdateCustomerDto } from "../customers/customers.dto";
import { pageArgs } from "./http";

describe("Validación de edición e importación", () => {
  const pipe = new ValidationPipe({ whitelist: true, transform: true });
  it("conserva metadatos de validación en los endpoints PATCH", () => {
    expect(Reflect.getMetadata("design:paramtypes", CatalogController.prototype, "updateProduct")[1]).toBe(UpdateProductDto);
  });
  it("rechaza negativos y no expone escrituras de relaciones", async () => {
    await expect(pipe.transform({ price: -10, stock: -2 }, { type: "body", metatype: UpdateProductDto })).rejects.toBeInstanceOf(BadRequestException);
    const result = await pipe.transform({ name: "Nuevo nombre", images: { deleteMany: {} }, archivedAt: new Date() }, { type: "body", metatype: UpdateProductDto });
    expect(Object.keys(result)).toEqual(["name"]);
    await expect(pipe.transform({ price: null }, { type: "body", metatype: UpdateProductDto })).rejects.toBeInstanceOf(BadRequestException);
  });
  it("permite borrar contacto y membresía sin exigir el resto del cliente", async () => {
    const result = await pipe.transform({ phone: null, membershipId: null }, { type: "body", metatype: UpdateCustomerDto });
    expect(result).toEqual({ phone: null, membershipId: null });
  });
  it("valida las filas del CSV también al llamar directamente a la API", async () => {
    const array = new ParseArrayPipe({ items: ProductDto, whitelist: true, forbidNonWhitelisted: true });
    await expect(array.transform([{ sku: "BAD", name: "Producto", price: -10, stock: -1, gender: "UNISEX", status: "ACTIVE", categoryId: "c", brandId: "b" }], { type: "body" })).rejects.toBeInstanceOf(BadRequestException);
  });
  it.each(["1.5", "Infinity", "-1", "NaN"])("rechaza la página inválida %s", (page) => {
    expect(() => pageArgs({ page })).toThrow(BadRequestException);
  });
});
