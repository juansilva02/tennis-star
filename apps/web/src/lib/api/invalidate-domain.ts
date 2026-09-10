import type { QueryClient } from "@tanstack/react-query";

const dependents: Record<string, string[]> = {
  products: ["products", "products-sale", "dashboard", "categories-all", "brands-all", "/categories", "/brands"],
  customers: ["/customers", "customers-sale", "loyalty", "memberships-options", "/memberships"],
  categories: ["/categories", "categories-all", "products", "dashboard"],
  brands: ["/brands", "brands-all", "products", "dashboard"],
  memberships: ["/memberships", "memberships-options", "/customers", "customers-sale"],
  loyalty: ["loyalty", "/customers"],
  sales: ["sales", "dashboard", "statistics", "/customers"],
};

export function invalidateDomain(client: QueryClient, resource: string) {
  return Promise.all((dependents[resource.replace(/^\//, "")] ?? [resource]).map((key) =>
    client.invalidateQueries({ queryKey: [key] }),
  ));
}
