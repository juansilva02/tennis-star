import { Badge } from "@/components/ui/badge";
const labels: Record<string, string> = {
  ACTIVE: "Activo",
  DRAFT: "Borrador",
  INACTIVE: "Inactivo",
  PENDING: "Pendiente",
  PROCESSING: "En preparación",
  SHIPPED: "Enviado",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
  UNPAID: "Pendiente",
  PAID: "Pagado",
  REFUNDED: "Reembolsado",
};
export function StatusBadge({ value }: { value: string }) {
  const variant =
    value === "COMPLETED" || value === "PAID" || value === "ACTIVE"
      ? "success"
      : value === "CANCELLED" || value === "REFUNDED" || value === "INACTIVE"
        ? "danger"
        : value === "PENDING" || value === "DRAFT"
          ? "warning"
          : "default";
  return <Badge variant={variant}>{labels[value] ?? value}</Badge>;
}
