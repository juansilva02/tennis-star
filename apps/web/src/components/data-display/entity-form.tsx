"use client";

import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Field } from "./entity-manager.types";

type FormValues = Record<string, unknown>;

export function EntityForm({ fields, initial, busy, onSubmit }: { fields: Field[]; initial: FormValues | null; busy: boolean; onSubmit: (data: FormValues) => void }) {
  const defaults = useMemo(() => Object.fromEntries(fields.map((field) => [
    field.key,
    field.type === "date" && initial?.[field.key] ? new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(String(initial[field.key]))) : (initial?.[field.key] ?? (field.type === "boolean" ? true : "")),
  ])), [fields, initial]);
  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({ defaultValues: defaults });
  return (
    <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit((raw) => {
      const data: FormValues = {};
      for (const field of fields) {
        let value = raw[field.key];
        if (field.type === "number") value = Number(value);
        if (field.type === "boolean") value = Boolean(value);
        if (field.type === "tags") value = String(value).split(",").map((item) => item.trim()).filter(Boolean);
        if (value === "") value = field.required ? undefined : null;
        data[field.key] = value;
      }
      onSubmit(data);
    })}>
      {fields.map((field) => (
        <label key={field.key} className={field.type === "textarea" || field.type === "tags" ? "sm:col-span-2" : ""}>
          <span className="mb-2 block text-sm font-medium">{field.label}{field.required && " *"}</span>
          {field.type === "textarea" ? <Textarea {...register(field.key, { required: field.required })} /> : field.type === "select" ? (
            <Controller
              name={field.key}
              control={control}
              rules={{ required: field.required }}
              render={({ field: controlledField }) => (
                <Select
                  value={String(controlledField.value ?? "")}
                  onValueChange={controlledField.onChange}
                  ariaLabel={field.label}
                  required={field.required}
                  options={[
                    { value: "", label: "Seleccionar" },
                    ...(field.options ?? []),
                  ]}
                />
              )}
            />
          ) : field.type === "boolean" ? <input type="checkbox" className="size-5 accent-zinc-900" {...register(field.key)} /> : (
            <Input type={field.type === "tags" ? "text" : (field.type ?? "text")} placeholder={field.placeholder} step={field.type === "number" ? "0.01" : undefined} {...register(field.key, { required: field.required })} />
          )}{" "}
          {errors[field.key] && <span className="mt-1 block text-xs text-red-600">Este campo es obligatorio.</span>}
        </label>
      ))}
      <div className="mt-2 flex justify-end sm:col-span-2"><Button disabled={busy}>{busy ? "Guardando..." : "Guardar cambios"}</Button></div>
    </form>
  );
}
