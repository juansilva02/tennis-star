"use client";

import { EntityManager } from "@/components/data-display/entity-manager";
import { booleanBadge } from "@/components/data-display/cells";
import type { Field } from "@/components/data-display/entity-manager.types";

const catalogFields: Field[] = [
  { key: "name", label: "Nombre", required: true },
  { key: "description", label: "Descripción", type: "textarea" },
  { key: "active", label: "Activa", type: "boolean" },
];

const columns = [
  { key: "name", label: "Nombre" },
  { key: "description", label: "Descripción", hideMobile: true },
  { key: "active", label: "Estado", render: (row: Record<string, any>) => booleanBadge(row.active) },
  { key: "count", label: "Productos", render: (row: Record<string, any>) => row._count?.products ?? 0 },
];

export function CategoriesPage() {
  return <EntityManager title="Categorías" description="Organizá los productos en categorías claras." resource="/categories" createLabel="Nueva categoría" fields={catalogFields} columns={columns} />;
}

export function BrandsPage() {
  return <EntityManager title="Marcas" description="Administrá las marcas disponibles en la tienda." resource="/brands" createLabel="Nueva marca" fields={catalogFields} columns={columns} />;
}
