"use client";

import { EntityManager } from "@/components/data-display/entity-manager";
import { booleanBadge, moneyCell } from "@/components/data-display/cells";
import type { Field } from "@/components/data-display/entity-manager.types";

const fields: Field[] = [
  { key: "name", label: "Nombre", required: true },
  { key: "price", label: "Precio mensual USD", type: "number", required: true },
  { key: "description", label: "Descripción", type: "textarea" },
  { key: "benefits", label: "Beneficios", type: "tags", placeholder: "Envío gratis, Soporte prioritario", required: true },
  { key: "active", label: "Activa", type: "boolean" },
];

export function MembershipsPage() {
  return <EntityManager title="Membresías" description="Definí planes y beneficios para tus clientes." resource="/memberships" createLabel="Nueva membresía" fields={fields} columns={[
    { key: "name", label: "Nombre" },
    { key: "price", label: "Precio", render: (row) => moneyCell(row.price) },
    { key: "benefits", label: "Beneficios", render: (row) => row.benefits?.join(", "), hideMobile: true },
    { key: "customers", label: "Clientes", render: (row) => row._count?.customers ?? 0 },
    { key: "active", label: "Estado", render: (row) => booleanBadge(row.active) },
  ]} />;
}
