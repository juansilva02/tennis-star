"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Dialog as D } from "radix-ui";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/motion/page-transition";
import { AppHeader } from "./app-header";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) setMobile(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  return (
    <D.Root open={mobile} onOpenChange={setMobile}>
    <div className="min-h-dvh">
      <div className="fixed inset-y-0 left-0 z-30 hidden border-r lg:block"><Sidebar /></div>
      <D.Portal>
        <D.Overlay className="dialog-overlay fixed inset-0 z-50 bg-black/45 lg:hidden" />
        <D.Content data-testid="mobile-drawer" aria-describedby={undefined} className="drawer-panel fixed inset-y-0 left-0 z-50 w-72 border-r bg-background shadow-xl outline-none lg:hidden">
          <D.Title className="sr-only">Menú de navegación</D.Title>
          <Sidebar className="w-full" />
          <D.Close asChild><Button variant="ghost" size="icon" className="absolute right-2 top-1" aria-label="Cerrar menú"><X className="size-5" /></Button></D.Close>
        </D.Content>
      </D.Portal>
      <AppHeader />
      <main id="contenido" className="p-4 sm:p-6 lg:ml-56 lg:p-8">
        <Suspense fallback={<div className="min-h-64" aria-hidden="true" />}>
          <PageTransition>{children}</PageTransition>
        </Suspense>
      </main>
    </div>
    </D.Root>
  );
}
