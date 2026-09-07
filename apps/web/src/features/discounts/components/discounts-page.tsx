"use client";

import { EntityManager } from "@/components/data-display/entity-manager";
import { booleanBadge, moneyCell } from "@/components/data-display/cells";
import type { Field } from "@/components/data-display/entity-manager.types";

const fields: Field[] = [
  { key: "name", label: "Nombre", required: true },
  { key: "code", label: "Código", required: true },
  { key: "type", label: "Tipo", type: "select", required: true, options: [
    { value: "PERCENTAGE", label: "Porcentaje" },
    { value: "FIXED", label: "Monto fijo en USD" },
  ] },
  { key: "value", label: "Valor", type: "number", required: true },
  { key: "startsAt", label: "Comienza", type: "date" },
  { key: "endsAt", label: "Finaliza", type: "date" },
  { key: "active", label: "Activo", type: "boolean" },
];

export function DiscountsPage() {
  return <EntityManager title="Descuentos" description="Creá códigos promocionales para futuras campañas." resource="/discounts" createLabel="Nuevo descuento" fields={fields} columns={[
    { key: "name", label: "Nombre" },
    { key: "code", label: "Código", render: (row) => <code>{row.code}</code> },
    { key: "type", label: "Tipo", render: (row) => row.type === "FIXED" ? "Monto fijo" : "Porcentaje" },
    { key: "value", label: "Valor", render: (row) => row.type === "FIXED" ? moneyCell(row.value) : `${row.value}%` },
    { key: "active", label: "Estado", render: (row) => booleanBadge(row.active) },
  ]} />;
}
