"use client";

import { useState } from "react";
import { HelpCircle, Mail, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const faqs = [
  ["¿Cómo creo una venta?", "Ingresá en Ventas, elegí Nuevo pedido, seleccioná el cliente y agregá uno o más productos."],
  ["¿El stock se descuenta automáticamente?", "No. En esta prueba el stock es un valor informativo y editable desde Productos."],
  ["¿Cómo importo productos?", "Desde Productos elegí Importar productos, descargá la plantilla CSV y validá la vista previa."],
  ["¿En qué moneda se muestran los precios?", "Todos los importes se guardan y muestran en dólares estadounidenses (USD)."],
  ["¿Puedo recuperar una venta oculta?", "Sí. La API conserva las ventas ocultas y permite restaurarlas sin perder historial."],
];

export function HelpPage() {
  const [search, setSearch] = useState("");
  const list = faqs.filter((faq) => faq.join(" ").toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader title="Ayuda" description="Respuestas rápidas para administrar Tennis Star." />
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar en preguntas frecuentes" className="pl-9" />
      </div>
      <div className="space-y-2">
        {list.map(([question, answer]) => (
          <details key={question} className="group rounded-xl border bg-card p-5"><summary className="cursor-pointer list-none font-medium">{question}</summary><p className="mt-3 text-sm leading-6 text-muted-foreground">{answer}</p></details>
        ))}
      </div>
      <Card><CardContent className="flex items-center gap-4 p-5">
        <div className="grid size-11 place-items-center rounded-full bg-muted"><HelpCircle className="size-5" /></div>
        <div className="flex-1"><p className="font-semibold">¿Necesitás más ayuda?</p><p className="text-sm text-muted-foreground">Escribinos y te responderemos a la brevedad.</p></div>
        <a href="mailto:hola@tennisstar.com"><Button variant="outline"><Mail className="size-4" />Contactar</Button></a>
      </CardContent></Card>
    </div>
  );
}
