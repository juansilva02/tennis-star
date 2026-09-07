"use client";

import { useState } from "react";
import { Palette, Plus, Ruler, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductOptionInput } from "@/features/products/types";
import { cn } from "@/lib/utils";

const COLOR_PRESETS = ["Negro", "Blanco", "Rojo", "Azul", "Verde"];
const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL"];

const colorSwatches: Record<string, string> = {
  Negro: "bg-zinc-950 ring-zinc-500",
  Blanco: "bg-white ring-zinc-300",
  Rojo: "bg-red-500 ring-red-300",
  Azul: "bg-blue-500 ring-blue-300",
  Verde: "bg-emerald-500 ring-emerald-300",
};

interface ProductOptionsEditorProps {
  value: ProductOptionInput[];
  onChange: (options: ProductOptionInput[]) => void;
}

function optionKind(name: string) {
  const normalized = name.toLocaleLowerCase("es");
  if (normalized === "color") return "color";
  if (["talla", "talle"].includes(normalized)) return "size";
  return "custom";
}

function OptionGroupEditor({
  option,
  onChange,
}: {
  option: ProductOptionInput;
  onChange: (values: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");
  const kind = optionKind(option.name);
  const presets =
    kind === "color" ? COLOR_PRESETS : kind === "size" ? SIZE_PRESETS : [];
  const Icon = kind === "color" ? Palette : kind === "size" ? Ruler : SlidersHorizontal;
  const displayName = kind === "size" ? "Talle" : option.name;

  function isSelected(candidate: string) {
    return option.values.some(
      (value) => value.toLocaleLowerCase("es") === candidate.toLocaleLowerCase("es"),
    );
  }

  function toggleValue(candidate: string) {
    const existing = option.values.find((value) =>
      value.localeCompare(candidate, "es", { sensitivity: "accent" }) === 0,
    );
    onChange(
      existing
        ? option.values.filter((value) => value !== existing)
        : [...option.values, candidate],
    );
    setMessage("");
  }

  function addValue() {
    const candidate = draft.trim();
    if (!candidate) return;
    if (isSelected(candidate)) {
      setMessage(`${candidate} ya está agregado.`);
      return;
    }
    onChange([...option.values, candidate]);
    setDraft("");
    setMessage("");
  }

  const customValues = option.values.filter(
    (value) => !presets.some((preset) => preset.toLocaleLowerCase("es") === value.toLocaleLowerCase("es")),
  );

  return (
    <section className="rounded-xl border border-border bg-muted/25 p-4" aria-label={`Opción ${displayName}`}>
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-lg border bg-background text-muted-foreground">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-semibold">{displayName}</h3>
          <p className="text-xs text-muted-foreground">
            {option.values.length
              ? `${option.values.length} ${option.values.length === 1 ? "valor seleccionado" : "valores seleccionados"}`
              : "Sin valores seleccionados"}
          </p>
        </div>
      </div>

      {presets.length ? (
        <div className="flex flex-wrap gap-2" aria-label={`Valores de ${displayName}`}>
          {presets.map((preset) => {
            const selected = isSelected(preset);
            return (
              <button
                key={preset}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleValue(preset)}
                className={cn(
                  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                {kind === "color" ? (
                  <span
                    className={cn(
                      "size-3.5 rounded-full ring-1 ring-inset",
                      colorSwatches[preset],
                    )}
                    aria-hidden="true"
                  />
                ) : null}
                {preset}
              </button>
            );
          })}
        </div>
      ) : null}

      {customValues.length ? (
        <div className="mt-3 flex flex-wrap gap-2" aria-label={`Valores personalizados de ${displayName}`}>
          {customValues.map((value) => (
            <span
              key={value}
              className="inline-flex min-h-9 items-center gap-1 rounded-full border bg-background py-1 pl-3 pr-1 text-sm"
            >
              {value}
              <button
                type="button"
                onClick={() => toggleValue(value)}
                className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Quitar ${value} de ${displayName}`}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Input
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setMessage("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addValue();
            }
          }}
          aria-label={`Nuevo valor para ${displayName}`}
          placeholder={kind === "color" ? "Otro color" : kind === "size" ? "Otro talle" : "Nuevo valor"}
        />
        <Button type="button" variant="outline" onClick={addValue} disabled={!draft.trim()}>
          <Plus className="size-4" aria-hidden="true" />
          Agregar
        </Button>
      </div>
      <p className="mt-1 min-h-4 text-xs text-red-600" aria-live="polite">
        {message}
      </p>
    </section>
  );
}

export function ProductOptionsEditor({ value, onChange }: ProductOptionsEditorProps) {
  function updateValues(index: number, values: string[]) {
    onChange(
      value.map((option, optionIndex) =>
        optionIndex === index ? { ...option, values } : option,
      ),
    );
  }

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">Opciones del producto</legend>
      <p className="mb-3 text-xs text-muted-foreground">
        Elegí los colores y talles disponibles. Esto no crea variantes ni modifica el stock.
      </p>
      <div className="grid gap-3 lg:grid-cols-2">
        {value.map((option, index) => (
          <OptionGroupEditor
            key={`${option.name}-${index}`}
            option={option}
            onChange={(values) => updateValues(index, values)}
          />
        ))}
      </div>
    </fieldset>
  );
}
