const ARGENTINA_MIDNIGHT_OFFSET = "T00:00:00-03:00";

export const monthOptions = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
].map((label, index) => ({
  value: String(index + 1).padStart(2, "0"),
  label,
}));

function argentinaMidnight(year: number, month: number) {
  const normalizedYear = year + Math.floor((month - 1) / 12);
  const normalizedMonth = ((month - 1) % 12 + 12) % 12;
  const date = `${normalizedYear}-${String(normalizedMonth + 1).padStart(2, "0")}-01`;
  return new Date(`${date}${ARGENTINA_MIDNIGHT_OFFSET}`).toISOString();
}

export function getStatisticsPeriodRange(year: string, month: string) {
  if (!year) return { from: "", to: "" };
  const numericYear = Number(year);
  const numericMonth = month ? Number(month) : 1;
  const endMonth = month ? numericMonth + 1 : 13;

  return {
    from: argentinaMidnight(numericYear, numericMonth),
    to: argentinaMidnight(numericYear, endMonth),
  };
}

export function getPeriodLabel(year: string, month: string) {
  if (!year) return "Todo el historial";
  const monthLabel = monthOptions.find((option) => option.value === month)?.label;
  return monthLabel ? `${monthLabel} de ${year}` : `Año ${year}`;
}
