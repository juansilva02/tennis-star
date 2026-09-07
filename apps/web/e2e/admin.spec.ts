import { expect, test } from "@playwright/test";
import { testAdminEmail, testAdminPassword } from "./test-credentials";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(testAdminEmail);
  await page.getByLabel("Contraseña", { exact: true }).fill(testAdminPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole("heading", { name: "Inicio" })).toBeVisible();
}

test.describe.serial("flujos administrativos", () => {
  test.beforeEach(async ({ page }) => login(page));

  test("crea, edita y elimina una categoría", async ({ page }) => {
    const suffix = Date.now();
    const original = `Prueba E2E ${suffix}`;
    const updated = `${original} editada`;

    await page.getByRole("link", { name: "Categorías" }).click();
    await page.getByRole("button", { name: "Nueva categoría" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/^Nombre/).fill(original);
    await dialog.getByLabel("Descripción").fill("Categoría temporal de prueba");
    await dialog.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByText("Registro creado")).toBeVisible();

    let row = page.getByRole("row").filter({ hasText: original });
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: "Editar" }).click();
    await page.getByRole("dialog").getByLabel(/^Nombre/).fill(updated);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Guardar cambios" })
      .click();
    await expect(page.getByText("Cambios guardados")).toBeVisible();

    row = page.getByRole("row").filter({ hasText: updated });
    await row.getByRole("button", { name: "Eliminar" }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Eliminar" })
      .click();
    await expect(page.getByText("Registro eliminado")).toBeVisible();
    await expect(row).toHaveCount(0);
  });

  test("importa un CSV validado", async ({ page }) => {
    const sku = `E2E-${Date.now()}`;
    await page.getByRole("link", { name: "Productos" }).click();
    await page.getByRole("button", { name: "Filtros", exact: true }).click();
    const filterPanel = page.getByRole("dialog", {
      name: "Filtrar productos",
    });
    await filterPanel.getByRole("combobox", { name: "Filtrar por estado" }).click();
    await page.getByRole("option", { name: "Activos", exact: true }).click();
    await expect(filterPanel).toBeVisible();
    await filterPanel.getByRole("button", { name: "Listo" }).click();
    await page.getByRole("button", { name: "Ordenar productos" }).click();
    await page.getByRole("menuitemradio", { name: "Nombre A–Z" }).click();
    await page.getByRole("button", { name: "Importar productos" }).click();
    const dialog = page.getByRole("dialog");
    const csv = [
      "sku,name,description,price,gender,category,brand,stock,status,imageUrl,options",
      `${sku},Producto E2E,Importado por Playwright,49.90,UNISEX,Calzado,Adidas,3,ACTIVE,,Color=Negro|Blanco`,
    ].join("\n");
    await dialog.locator('input[type="file"]').setInputFiles({
      name: "productos.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csv),
    });
    await expect(dialog.getByText("Todas las filas son válidas.")).toBeVisible();
    await dialog.getByRole("button", { name: "Confirmar importación" }).click();
    await expect(page.getByText("1 productos importados")).toBeVisible();
    await page.getByPlaceholder("Buscar por nombre, SKU o ID").fill(sku);
    const productRow = page.getByRole("row").filter({ hasText: sku });
    await expect(productRow).toBeVisible();

    await productRow.getByRole("button", { name: "Editar" }).click();
    const editDialog = page.getByRole("dialog", { name: "Editar producto" });
    const colorOptions = editDialog.getByRole("region", {
      name: "Opción Color",
    });
    await expect(colorOptions.getByRole("button", { name: "Negro" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await colorOptions.getByLabel("Nuevo valor para Color").fill("Turquesa");
    await colorOptions.getByRole("button", { name: "Agregar" }).click();
    await expect(colorOptions.getByText("Turquesa")).toBeVisible();

    const sizeOptions = editDialog.getByRole("region", { name: "Opción Talle" });
    await sizeOptions.getByRole("button", { name: "M", exact: true }).click();
    await expect(
      sizeOptions.getByRole("button", { name: "M", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await editDialog.getByRole("button", { name: "Cerrar" }).click();
  });

  test("genera, completa, oculta y restaura una venta", async ({ page }) => {
    await page.getByRole("link", { name: "Ventas" }).click();
    await page.getByRole("button", { name: "Nuevo pedido" }).click();
    const dialog = page.getByRole("dialog");
    const customerSearch = dialog.getByRole("combobox", {
      name: "Buscar cliente por nombre, ID o dirección",
    });
    await customerSearch.fill("Santiago Pérez");
    const customerResults = dialog.getByRole("listbox");
    await expect(customerResults).toBeVisible();
    const resultsBackground = await customerResults.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    expect(resultsBackground).not.toBe("rgba(0, 0, 0, 0)");
    await dialog.getByRole("option", { name: "Santiago Pérez" }).click();
    const productSearch = dialog.getByRole("combobox", {
      name: "Buscar producto 1 por SKU, ID o nombre",
    });
    await productSearch.fill("Adidas CourtJam Control");
    await dialog
      .getByRole("option", { name: /Adidas CourtJam Control/ })
      .click();
    await dialog.getByRole("combobox", { name: "Método de pago" }).click();
    await page.getByRole("option", { name: "Transferencia" }).click();
    await dialog
      .getByLabel("Notas opcionales")
      .fill(`E2E Playwright ${Date.now()}`);
    await dialog.getByRole("button", { name: "Generar venta" }).click();
    await expect(page.getByText("Venta registrada")).toBeVisible();

    const row = page.getByRole("row").nth(1);
    const order = await row.locator("td").nth(1).innerText();
    await row.getByRole("button", { name: "Gestionar pedido" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Completar" }).click();
    await expect(page.getByText("Pedido actualizado")).toBeVisible();

    const completed = page.getByRole("row").filter({ hasText: order });
    await expect(completed).toContainText("Completado");
    await completed.getByRole("button", { name: "Ocultar venta" }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Ocultar venta" })
      .click();
    await page.getByRole("button", { name: "Ver ventas ocultas" }).click();

    const hidden = page.getByRole("row").filter({ hasText: order });
    await expect(hidden).toBeVisible();
    await hidden.getByRole("button", { name: "Restaurar venta" }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Restaurar venta" })
      .click();
    await expect(page.getByText("Venta restaurada")).toBeVisible();
  });

  test("actualiza la foto de perfil desde configuración", async ({ page }) => {
    await page.getByRole("link", { name: "Configuración" }).click();
    const image = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAPoAAAD6AG1e1JrAAAARUlEQVRYhe3XsREAMAhC0UzCYMzpfmaLpHmFvXcifE46+3OOBeIEJcLxhsuIwoorjEYcLyAJJCsoHVi+iklUsyqn81wHF+64rHm7IyZUAAAAAElFTkSuQmCC",
      "base64",
    );
    await page.getByLabel("Seleccionar foto de perfil").setInputFiles({
      name: "avatar.png",
      mimeType: "image/png",
      buffer: image,
    });
    await expect(page.getByText("Foto de perfil actualizada")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Editar foto de perfil" }).locator("img"),
    ).toBeVisible();

    await page.reload();
    await expect(page.getByRole("button", { name: "Quitar foto" })).toBeVisible();
    await page.getByRole("button", { name: "Quitar foto" }).click();
    await expect(page.getByText("Foto de perfil eliminada")).toBeVisible();
  });

  test("filtra estadísticas por año y mes", async ({ page }) => {
    const year = String(new Date().getFullYear());
    await page.getByRole("link", { name: "Estadísticas" }).click();

    await page
      .getByRole("combobox", { name: "Filtrar estadísticas por año" })
      .click();
    await page.getByRole("option", { name: year, exact: true }).click();

    const monthlyResponse = page.waitForResponse((response) => {
      if (!response.url().includes("/api/v1/statistics?")) return false;
      const from = new URL(response.url()).searchParams.get("from");
      return from?.startsWith(`${year}-09-01`) ?? false;
    });
    await page
      .getByRole("combobox", { name: "Filtrar estadísticas por mes" })
      .click();
    await page.getByRole("option", { name: "Septiembre" }).click();
    await monthlyResponse;

    await expect(page.getByText(`Mostrando: Septiembre de ${year}`)).toBeVisible();
    await page.getByRole("button", { name: "Limpiar" }).click();
    await expect(page.getByText("Mostrando: Todo el historial")).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: "Filtrar estadísticas por mes" }),
    ).toBeDisabled();
  });
});
