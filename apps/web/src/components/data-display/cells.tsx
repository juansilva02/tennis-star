import { Badge } from "@/components/ui/badge";
import { money } from "@/lib/utils";

export const booleanBadge = (value: boolean) => (
  <Badge variant={value ? "success" : "outline"}>{value ? "Activo" : "Inactivo"}</Badge>
);

export const moneyCell = (value: unknown) => (
  <span className="font-mono font-medium">{money.format(Number(value))}</span>
);
