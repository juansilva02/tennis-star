const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

function argentinaDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ARGENTINA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
  };
}

export function argentinaDateKey(date: Date) {
  const { year, month, day } = argentinaDateParts(date);
  return `${year}-${month}-${day}`;
}

export function argentinaYear(date: Date) {
  return Number(argentinaDateParts(date).year);
}

export function argentinaDayRange(now = new Date()) {
  const date = argentinaDateKey(now);
  const from = new Date(`${date}T00:00:00-03:00`);
  return { from, to: new Date(from.getTime() + 24 * 60 * 60 * 1000) };
}
