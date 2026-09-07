"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "./app-header";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobile, setMobile] = useState(false);
  const reduceMotion = useReducedMotion();
  return (
    <div className="min-h-dvh">
      <div className="fixed inset-y-0 left-0 z-30 hidden border-r lg:block"><Sidebar /></div>
      <AnimatePresence>
      {mobile && <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}>
        <motion.button aria-label="Cerrar menú" className="absolute inset-0 bg-black/45" onClick={() => setMobile(false)} />
        <motion.div data-testid="mobile-drawer" className="relative h-full w-72 border-r bg-background shadow-xl" initial={reduceMotion ? false : { x: -24 }} animate={{ x: 0 }} exit={reduceMotion ? { opacity: 0 } : { x: -24, opacity: 0 }} transition={{ duration: 0.2 }}>
          <Sidebar className="w-full" />
          <Button variant="ghost" size="icon" className="absolute right-2 top-1" onClick={() => setMobile(false)} aria-label="Cerrar menú"><X className="size-5" /></Button>
        </motion.div>
      </motion.div>}
      </AnimatePresence>
      <AppHeader openMenu={() => setMobile(true)} />
      <main id="contenido" className="p-4 sm:p-6 lg:ml-56 lg:p-8">
        {children}
      </main>
    </div>
  );
}
