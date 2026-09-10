import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    let body: unknown = { data: [], meta: { page: 1, pageCount: 0, total: 0 } };
    if (url.pathname.endsWith("/auth/me")) body = { data: { id: "admin", name: "Administrador", email: "admin@example.invalid" } };
    if (url.pathname.endsWith("/sales/summary/today")) body = { data: { count: 0, total: "0" } };
    if (url.pathname.endsWith("/sales/options/customers")) body = {
      data: [{ id: "customer-150", name: "Cliente fuera de los primeros 100", email: "cliente@example.invalid", address: "Av. Siempre Viva 123" }], nextCursor: null,
    };
    if (url.pathname.endsWith("/sales/options/products")) body = {
      data: [{ id: "product-150", name: "Producto remoto", sku: "SKU-150", price: "20" }], nextCursor: null,
    };
    await route.fulfill({ json: body });
  });
});

test("menú móvil: encierra el foco, permite Escape y lo restaura", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/ventas");
  const opener = page.getByRole("button", { name: "Abrir menú" });
  await opener.click();
  const drawer = page.getByRole("dialog", { name: "Menú de navegación" });
  await expect(drawer).toBeVisible();
  for (let i = 0; i < 18; i++) {
    await page.keyboard.press("Tab");
    await expect.poll(() => drawer.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(opener).toBeFocused();
});

test("busca opciones remotas y mantiene el producto y precio seleccionados", async ({ page }) => {
  await page.goto("/ventas");
  await page.getByRole("button", { name: "Nuevo pedido" }).click();
  const dialog = page.getByRole("dialog", { name: "Generar venta" });
  const customer = dialog.getByRole("combobox", { name: "Buscar cliente por nombre, ID o dirección" });
  const customerRequest = page.waitForRequest((request) => new URL(request.url()).searchParams.get("search") === "cliente-150");
  await customer.fill("cliente-150");
  await customerRequest;
  await dialog.getByRole("option", { name: /Cliente fuera/ }).click();
  await expect(dialog.getByLabel("Dirección de envío")).toHaveValue("Av. Siempre Viva 123");
  await dialog.getByRole("combobox", { name: "Buscar producto 1 por SKU, ID o nombre" }).fill("SKU-150");
  await dialog.getByRole("option", { name: /Producto remoto/ }).click();
  await dialog.getByLabel("Cantidad del producto 1").fill("3");
  await expect(dialog.getByText(/60,00/)).toBeVisible();
  await dialog.getByRole("button", { name: "Agregar", exact: true }).click();
  await expect(dialog.getByRole("combobox", { name: "Buscar producto 1 por SKU, ID o nombre" })).toHaveValue(/Producto remoto/);
});

test("el diálogo conserva una animación de salida y respeta movimiento reducido", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ventas");
  await page.getByRole("button", { name: "Nuevo pedido" }).click();
  const dialog = page.getByRole("dialog", { name: "Generar venta" });
  const duration = await dialog.evaluate((el) => getComputedStyle(el).animationDuration);
  expect(parseFloat(duration)).toBeLessThan(0.001);
  await dialog.getByRole("button", { name: "Cerrar", exact: true }).click();
  await expect(dialog).toBeHidden();
});

test("cambiar el filtro desde la segunda página vuelve a la primera", async ({ page }) => {
  await page.route("**/api/v1/sales?**", async (route) => {
    const url = new URL(route.request().url());
    const search = url.searchParams.get("search");
    const current = Number(url.searchParams.get("page"));
    await route.fulfill({ json: { data: [{ id: "sale-1", orderNumber: search ? "BUSCADA" : "ORDEN", customer: { name: "Cliente" }, status: "PENDING", paymentStatus: "UNPAID", total: "20", createdAt: "2026-09-10T12:00:00Z" }], meta: { page: current, pageCount: search ? 1 : 2, total: search ? 1 : 11 } } });
  });
  await page.goto("/ventas");
  await page.getByRole("button", { name: "Página siguiente" }).click();
  await expect(page.getByText(/Página 2 de 2/)).toBeVisible();
  const request = page.waitForRequest((req) => req.url().includes("/sales?") && new URL(req.url()).searchParams.get("search") === "BUSCADA");
  await page.getByPlaceholder("Buscar por orden o cliente").fill("BUSCADA");
  expect(new URL((await request).url()).searchParams.get("page")).toBe("1");
  await expect(page.getByText("#BUSCADA")).toBeVisible();
});

test("cargar más opciones conserva el cursor y permite seleccionar la página siguiente", async ({ page }) => {
  await page.route("**/sales/options/products?**", async (route) => {
    const cursor = new URL(route.request().url()).searchParams.get("cursor");
    await route.fulfill({ json: { data: [{ id: cursor ? "product-151" : "product-150", name: cursor ? "Página siguiente" : "Primera página", sku: cursor ? "SKU-151" : "SKU-150", price: "20" }], nextCursor: cursor ? null : "product-150" } });
  });
  await page.goto("/ventas");
  await page.getByRole("button", { name: "Nuevo pedido" }).click();
  const dialog = page.getByRole("dialog", { name: "Generar venta" });
  const product = dialog.getByRole("combobox", { name: "Buscar producto 1 por SKU, ID o nombre" });
  await product.click();
  await dialog.getByRole("button", { name: "Cargar más resultados" }).click();
  await dialog.getByRole("option", { name: /Página siguiente/ }).click();
  await expect(product).toHaveValue(/SKU-151/);
});

test("descarta una validación de descuento si cambian las cantidades", async ({ page }) => {
  let release!: () => void;
  const deferred = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/sales/discounts/preview", async (route) => {
    await deferred;
    await route.fulfill({ json: { data: { code: "PROMO", name: "Promo anterior", total: "18", subtotal: "20", discountAmount: "2" } } });
  });
  await page.goto("/ventas");
  await page.getByRole("button", { name: "Nuevo pedido" }).click();
  const dialog = page.getByRole("dialog", { name: "Generar venta" });
  await dialog.getByRole("combobox", { name: "Buscar producto 1 por SKU, ID o nombre" }).click();
  await dialog.getByRole("option", { name: /Producto remoto/ }).click();
  await dialog.getByLabel("Código de descuento").fill("PROMO");
  const request = page.waitForRequest("**/sales/discounts/preview");
  await dialog.getByRole("button", { name: "Aplicar", exact: true }).click();
  await request;
  await dialog.getByLabel("Cantidad del producto 1").fill("3");
  release();
  await expect(dialog.getByRole("button", { name: "Aplicar", exact: true })).toBeEnabled();
  await expect(dialog.getByText("Promo anterior", { exact: false })).toHaveCount(0);
  await expect(dialog.getByText(/60,00/)).toBeVisible();
});

test("vaciar teléfono y membresía envía null en la edición", async ({ page }) => {
  await page.route("**/api/v1/memberships?**", (route) => route.fulfill({ json: { data: [{ id: "m", name: "Club" }], meta: { page: 1, pageCount: 1, total: 1 } } }));
  await page.route("**/api/v1/customers**", (route) => route.fulfill({ json: { data: [{ id: "c", name: "Cliente", email: "cliente@example.invalid", phone: "12345", membershipId: "m" }], meta: { page: 1, pageCount: 1, total: 1 } } }));
  await page.goto("/clientes");
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Teléfono").fill("");
  await dialog.getByRole("combobox", { name: "Membresía" }).click();
  await page.getByRole("option", { name: "Seleccionar", exact: true }).click();
  const request = page.waitForRequest((req) => req.method() === "PATCH" && req.url().endsWith("/customers/c"));
  await dialog.getByRole("button", { name: "Guardar cambios" }).click();
  expect((await request).postDataJSON()).toMatchObject({ phone: null, membershipId: null });
});

test("el detalle se carga al abrir y refleja cambios al volver a abrir en móvil", async ({ page }) => {
  let detailRequests = 0;
  let paymentStatus = "UNPAID";
  const sale = () => ({ id: "sale-1", orderNumber: "TS-2026-0123456789ABCDEF0123456789ABCDEF", customer: { name: "Cliente", email: "cliente@example.invalid" }, status: "PENDING", paymentStatus, total: "20", shippingAddress: "Calle 123", createdAt: "2026-09-10T12:00:00Z", items: [], history: [] });
  await page.route("**/api/v1/sales?**", (route) => route.fulfill({ json: { data: [sale()], meta: { page: 1, pageCount: 1, total: 1 } } }));
  await page.route("**/api/v1/sales/sale-1", (route) => {
    detailRequests++;
    return route.fulfill({ json: { data: sale() } });
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/ventas");
  await expect(page.getByRole("button", { name: "Gestionar pedido" })).toBeVisible();
  expect(detailRequests).toBe(0);
  await page.getByRole("button", { name: "Gestionar pedido" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("combobox", { name: "Estado del pago" })).toHaveText("Pendiente");
  const title = dialog.getByRole("heading", { level: 2 });
  expect(await title.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  await dialog.getByRole("button", { name: "Cerrar", exact: true }).click();
  await expect(dialog).toBeHidden();
  const previousRequests = detailRequests;
  paymentStatus = "PAID";
  await page.getByRole("button", { name: "Gestionar pedido" }).click();
  await expect(dialog.getByRole("combobox", { name: "Estado del pago" })).toHaveText("Pagado");
  expect(detailRequests).toBeGreaterThan(previousRequests);
});
