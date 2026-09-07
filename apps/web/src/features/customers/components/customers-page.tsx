"use client";

import { useQuery } from "@tanstack/react-query";
import { EntityManager } from "@/components/data-display/entity-manager";
import type { Field } from "@/components/data-display/entity-manager.types";
import { getMembershipOptions } from "../api/customers-api";

export function CustomersPage() {
  const memberships = useQuery({ queryKey: ["memberships-options"], queryFn: getMembershipOptions });
  const fields: Field[] = [
    { key: "name", label: "Nombre", required: true },
    { key: "email", label: "Correo", type: "email", required: true },
    { key: "phone", label: "Teléfono" },
    { key: "address", label: "Dirección" },
    { key: "city", label: "Ciudad" },
    { key: "postalCode", label: "Código postal" },
    { key: "avatarUrl", label: "URL del avatar" },
    { key: "membershipId", label: "Membresía", type: "select", options: (memberships.data?.data ?? []).map((membership) => ({ value: membership.id, label: membership.name })) },
  ];

  return <EntityManager title="Clientes" description="Información, membresías y actividad de tus clientes." resource="/customers" createLabel="Nuevo cliente" archive fields={fields} columns={[
    { key: "name", label: "Cliente", render: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.email}</p></div> },
    { key: "phone", label: "Teléfono", hideMobile: true },
    { key: "membership", label: "Membresía", render: (row) => row.membership?.name ?? "Sin membresía" },
    { key: "points", label: "Puntos" },
    { key: "sales", label: "Ventas", render: (row) => row._count?.sales ?? 0, hideMobile: true },
  ]} />;
}
