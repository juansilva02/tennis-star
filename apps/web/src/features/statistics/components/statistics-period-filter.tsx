"use client";

import { CalendarRange, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  getPeriodLabel,
  monthOptions,
} from "@/features/statistics/lib/statistics-period";

interface StatisticsPeriodFilterProps {
  year: string;
  month: string;
  availableYears: number[];
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
  onClear: () => void;
}

export function StatisticsPeriodFilter({
  year,
  month,
  availableYears,
  onYearChange,
  onMonthChange,
  onClear,
}: StatisticsPeriodFilterProps) {
  const years = [...new Set([new Date().getFullYear(), ...availableYears])].sort(
    (a, b) => b - a,
  );

  return (
    <section
      className="rounded-xl border bg-card p-4"
      aria-labelledby="statistics-period-title"
    >
      <div className="mb-3 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg border bg-background text-muted-foreground">
          <CalendarRange className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 id="statistics-period-title" className="text-sm font-semibold">
            Período del informe
          </h2>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Mostrando: {getPeriodLabel(year, month)}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(160px,220px)_minmax(180px,240px)_auto] sm:items-end">
        <label className="block text-sm font-medium">
          <span className="mb-2 block">Año</span>
          <Select
            value={year}
            onValueChange={(value) => {
              onYearChange(value);
              if (!value) onMonthChange("");
            }}
            ariaLabel="Filtrar estadísticas por año"
            options={[
              { value: "", label: "Todos los años" },
              ...years.map((value) => ({
                value: String(value),
                label: String(value),
              })),
            ]}
          />
        </label>

        <label className="block text-sm font-medium">
          <span className="mb-2 block">Mes</span>
          <Select
            value={month}
            onValueChange={onMonthChange}
            ariaLabel="Filtrar estadísticas por mes"
            disabled={!year}
            options={[{ value: "", label: "Todos los meses" }, ...monthOptions]}
          />
        </label>

        <Button
          type="button"
          variant="outline"
          onClick={onClear}
          disabled={!year && !month}
          className="sm:justify-self-start"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Limpiar
        </Button>
      </div>
    </section>
  );
}
