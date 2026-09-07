import { describe, expect, it } from "vitest";
import {
  cleanProductOptions,
  parseProductOptions,
  toProductOptionInputs,
} from "./product-options";

describe("opciones de producto", () => {
  it("conserva las opciones existentes y agrega color y talle cuando faltan", () => {
    expect(
      toProductOptionInputs([
        {
          id: "material",
          name: "Material",
          values: [{ id: "algodon", value: "Algodón" }],
        },
      ]),
    ).toEqual([
      { name: "Material", values: ["Algodón"] },
      { name: "Color", values: [] },
      { name: "Talla", values: [] },
    ]);
  });

  it("elimina grupos vacíos antes de enviar el producto", () => {
    expect(
      cleanProductOptions([
        { name: "Color", values: [" Negro ", "Negro", "Blanco"] },
        { name: "Talla", values: [] },
      ]),
    ).toEqual([{ name: "Color", values: ["Negro", "Blanco"] }]);
  });

  it("mantiene el formato técnico exclusivamente para importaciones CSV", () => {
    expect(parseProductOptions("Color=Azul|Rojo;Talla=M|L")).toEqual([
      { name: "Color", values: ["Azul", "Rojo"] },
      { name: "Talla", values: ["M", "L"] },
    ]);
  });
});
