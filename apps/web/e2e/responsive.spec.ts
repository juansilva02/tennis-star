import { expect, test } from "@playwright/test";
import { testAdminEmail, testAdminPassword } from "./test-credentials";

test("el login no desborda en una pantalla móvil", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Iniciá sesión" })).toBeVisible();
  const sizes = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(sizes.content).toBeLessThanOrEqual(sizes.viewport);
});

test("el menú móvil es opaco y permanece abierto al navegar", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(testAdminEmail);
  await page.getByLabel("Contraseña", { exact: true }).fill(testAdminPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.getByRole("button", { name: "Abrir menú" }).click();

  const drawer = page.getByTestId("mobile-drawer");
  const sidebar = drawer.getByRole("complementary");
  await expect(drawer).toBeVisible();
  await expect(sidebar).toBeVisible();
  const appearance = await drawer.evaluate((element) => ({
    drawerWidth: element.getBoundingClientRect().width,
    sidebarWidth: element.querySelector("aside")?.getBoundingClientRect().width,
    background: getComputedStyle(element).backgroundColor,
  }));

  expect(appearance.sidebarWidth).toBeGreaterThanOrEqual(
    appearance.drawerWidth - 1,
  );
  expect(appearance.background).not.toBe("rgba(0, 0, 0, 0)");

  await drawer.getByRole("link", { name: "Ventas", exact: true }).click();
  await expect(page).toHaveURL(/\/ventas$/);
  await expect(drawer).toBeVisible();

  await drawer.getByRole("button", { name: "Cerrar menú" }).click();
  await expect(drawer).toBeHidden();
});

test("el editor visual de opciones funciona sin desbordar en móvil", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(testAdminEmail);
  await page.getByLabel("Contraseña", { exact: true }).fill(testAdminPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.goto("/productos");
  await page.getByRole("button", { name: "Nuevo producto" }).click();

  const dialog = page.getByRole("dialog", { name: "Nuevo producto" });
  const colorOptions = dialog.getByRole("region", { name: "Opción Color" });
  await colorOptions.scrollIntoViewIfNeeded();
  await colorOptions.getByRole("button", { name: "Azul" }).click();
  await expect(
    colorOptions.getByRole("button", { name: "Azul" }),
  ).toHaveAttribute("aria-pressed", "true");

  const dimensions = await dialog.evaluate((element) => ({
    left: element.getBoundingClientRect().left,
    right: element.getBoundingClientRect().right,
    viewport: document.documentElement.clientWidth,
  }));
  expect(dimensions.left).toBeGreaterThanOrEqual(0);
  expect(dimensions.right).toBeLessThanOrEqual(dimensions.viewport);
});

test("los filtros de estadísticas se apilan correctamente en móvil", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(testAdminEmail);
  await page.getByLabel("Contraseña", { exact: true }).fill(testAdminPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.goto("/estadisticas");

  const filter = page.getByRole("region", { name: "Período del informe" });
  await expect(filter).toBeVisible();
  const dimensions = await filter.evaluate((element) => ({
    left: element.getBoundingClientRect().left,
    right: element.getBoundingClientRect().right,
    viewport: document.documentElement.clientWidth,
  }));
  expect(dimensions.left).toBeGreaterThanOrEqual(0);
  expect(dimensions.right).toBeLessThanOrEqual(dimensions.viewport);
});

test("la tabla de puntos conserva el ancho de la página en móvil", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(testAdminEmail);
  await page.getByLabel("Contraseña", { exact: true }).fill(testAdminPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.goto("/puntos-lealtad");

  await expect(page.getByRole("table")).toBeVisible();
  const sizes = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(sizes.content).toBeLessThanOrEqual(sizes.viewport);
});

test("el panel de filtros de productos conserva márgenes y espaciado en móvil", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(testAdminEmail);
  await page.getByLabel("Contraseña", { exact: true }).fill(testAdminPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.goto("/productos");
  await page.getByRole("button", { name: "Filtros", exact: true }).click();

  const panel = page.getByRole("dialog", { name: "Filtrar productos" });
  const dimensions = await panel.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const styles = getComputedStyle(element);
    return {
      left: bounds.left,
      right: bounds.right,
      viewport: document.documentElement.clientWidth,
      padding: Number.parseFloat(styles.paddingLeft),
    };
  });
  expect(dimensions.left).toBeGreaterThanOrEqual(16);
  expect(dimensions.right).toBeLessThanOrEqual(dimensions.viewport - 16);
  expect(dimensions.padding).toBeGreaterThanOrEqual(20);

  const closeSize = await panel
    .getByRole("button", { name: "Cerrar filtros" })
    .evaluate((element) => element.getBoundingClientRect().width);
  expect(closeSize).toBeGreaterThanOrEqual(44);
});
