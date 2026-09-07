"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/errors";
import { getSettings, updateSettings } from "../api/settings-api";
import type { StoreSettings } from "../types";
import { ProfileAvatarForm } from "./profile-avatar-form";

export function SettingsPage() {
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const [draft, setDraft] = useState<StoreSettings | null>(null);
  const current = draft ?? settings.data?.data;
  const save = useMutation({
    mutationFn: () => updateSettings(current!),
    onSuccess: () => { toast.success("Configuración guardada"); queryClient.invalidateQueries({ queryKey: ["settings"] }); },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const set = (key: keyof StoreSettings, value: string) => setDraft({ ...current!, [key]: value });
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader title="Configuración" description="Datos públicos y preferencias de Tennis Star." />
      {current && <Card><CardContent className="grid gap-4 p-6 sm:grid-cols-2">
        <ProfileAvatarForm />
        <Setting label="Nombre de la tienda" value={current.storeName} onChange={(value) => set("storeName", value)} />
        <Setting label="Correo de soporte" value={current.supportEmail} onChange={(value) => set("supportEmail", value)} type="email" />
        <Setting label="Teléfono" value={current.phone ?? ""} onChange={(value) => set("phone", value)} />
        <Setting label="Prefijo de órdenes" value={current.orderPrefix} onChange={(value) => set("orderPrefix", value)} />
        <div className="sm:col-span-2"><Setting label="Dirección" value={current.address ?? ""} onChange={(value) => set("address", value)} /></div>
        <div className="flex justify-end sm:col-span-2"><Button onClick={() => save.mutate()} disabled={save.isPending}>Guardar configuración</Button></div>
      </CardContent></Card>}
    </div>
  );
}

function Setting({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="text-sm font-medium">{label}<Input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2" /></label>;
}
