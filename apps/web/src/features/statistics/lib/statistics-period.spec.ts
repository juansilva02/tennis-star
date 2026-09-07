import { describe, expect, it } from "vitest";
import {
  getPeriodLabel,
  getStatisticsPeriodRange,
} from "./statistics-period";

describe("rango temporal de estadísticas", () => {
  it("calcula un mes completo usando medianoche argentina", () => {
    expect(getStatisticsPeriodRange("2026", "09")).toEqual({
      from: "2026-09-01T03:00:00.000Z",
      to: "2026-10-01T03:00:00.000Z",
    });
  });

  it("calcula un año completo", () => {
    expect(getStatisticsPeriodRange("2026", "")).toEqual({
      from: "2026-01-01T03:00:00.000Z",
      to: "2027-01-01T03:00:00.000Z",
    });
  });

  it("describe el período seleccionado", () => {
    expect(getPeriodLabel("2026", "09")).toBe("Septiembre de 2026");
    expect(getPeriodLabel("", "")).toBe("Todo el historial");
  });
});
