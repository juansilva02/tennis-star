import { BadRequestException } from "@nestjs/common";

// Date-only campaign boundaries refer to the Argentine calendar day.
export function discountDate(value?: string | null, endOfDay = false) {
  if (!value) return null;
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}-03:00`
    : value);
  if (Number.isNaN(date.getTime())) throw new BadRequestException("Fecha inválida");
  return date;
}
