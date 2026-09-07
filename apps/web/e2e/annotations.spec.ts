import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { testAdminEmail, testAdminPassword } from "./test-credentials";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(testAdminEmail);
  await page.getByLabel("Contraseña", { exact: true }).fill(testAdminPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/home$/);
}

test.beforeEach(async ({ page }) => login(page));

test("muestra el resumen real de ventas del día", async ({ page }) => {
  const responsePromise = page.waitForResponse((response) =>
    response.url().includes("/api/v1/sales/summary/today"),
  );
  await page.goto("/ventas");
  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();
  const payload = (await response.json()) as {
    data: { count: number; total: string };
  };

  const summary = page.getByLabel("Resumen de ventas de hoy");
  await expect(summary).toBeVisible();
  await expect(summary).toContainText("Ventas de hoy");
  await expect(summary).toContainText(String(payload.data.count));
});

test("abre el selector de cliente sólo después de una acción manual", async ({ page }) => {
  await page.goto("/ventas");
  await page.getByRole("button", { name: "Nuevo pedido" }).click();
  const customer = page.getByRole("combobox", {
    name: "Buscar cliente por nombre, ID o dirección",
  });

  await expect(customer).toBeFocused();
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await customer.click();
  await expect(page.getByRole("listbox")).toBeVisible();
});

test("destaca en rojo el total de una venta reembolsada", async ({ page }) => {
  await page.goto("/ventas");
  const refundedRow = page.getByRole("row").filter({ hasText: "Reembolsado" }).first();
  await expect(refundedRow).toBeVisible();
  const total = refundedRow.locator("td").nth(4);
  await expect(total).toHaveClass(/text-destructive/);
  await expect(total).toContainText("Reembolsado");
});

test("muestra lealtad como tabla, ordena el saldo y separa las acciones", async ({ page }) => {
  await page.goto("/puntos-lealtad");
  const table = page.getByRole("table");
  await expect(table).toBeVisible();
  await expect(page.getByRole("button", { name: "Ajustar" })).toHaveCount(0);

  await page.getByRole("combobox", { name: "Ordenar clientes por puntos" }).click();
  await page.getByRole("option", { name: "Menos puntos primero" }).click();
  await expect(table.getByRole("columnheader", { name: /Saldo/ })).toHaveAttribute(
    "aria-sort",
    "ascending",
  );

  const balances = await table
    .getByRole("row")
    .locator("td:nth-child(3)")
    .allTextContents();
  const values = balances.map((balance) =>
    Number(balance.replace(/\D/g, "")),
  );
  expect(values).toEqual([...values].sort((a, b) => a - b));

  await table.getByRole("button", { name: /^Sumar puntos a / }).first().click();
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Sumar puntos" })).toBeVisible();
  await page.getByRole("button", { name: "Cerrar" }).click();

  await table.getByRole("button", { name: /^Quitar puntos a / }).first().click();
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Quitar puntos" })).toBeVisible();
});

test("exporta el período de estadísticas en CSV y PDF", async ({ page }) => {
  await page.goto("/estadisticas");
  await expect(page.getByText("Ingresos netos", { exact: true })).toBeVisible();
  await expect(page.getByText("Reembolsos", { exact: true })).toBeVisible();
  await expect(page.getByText("Pedidos cancelados", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Exportar CSV" })).toBeEnabled();

  const csvDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar CSV" }).click();
  const csvDownload = await csvDownloadPromise;
  expect(csvDownload.suggestedFilename()).toMatch(/tennis-star-estadisticas-.*\.csv$/);
  const csvPath = await csvDownload.path();
  expect(csvPath).not.toBeNull();
  expect(await readFile(csvPath!, "utf8")).toContain("Informe de estadísticas");

  const pdfDownloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar PDF" }).click();
  const pdfDownload = await pdfDownloadPromise;
  expect(pdfDownload.suggestedFilename()).toMatch(/tennis-star-estadisticas-.*\.pdf$/);
  const pdfPath = await pdfDownload.path();
  expect(pdfPath).not.toBeNull();
  expect((await readFile(pdfPath!)).subarray(0, 4).toString()).toBe("%PDF");
});
