"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { Bell, ChevronLeft, LogOut, Menu, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { getCurrentUser } from "@/features/auth/api/auth-api";
import { api } from "@/lib/api/client";
import { navigationItems } from "./navigation";

export function AppHeader({ openMenu }: { openMenu: () => void }) {
  const path = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const user = useQuery({ queryKey: ["me"], queryFn: getCurrentUser });
  const label = navigationItems.find(([href]) => path.startsWith(href))?.[1] ?? "Tennis Star";
  async function logout() {
    await api("/auth/logout", { method: "POST" });
    toast.success("Sesión cerrada");
    router.replace("/login");
  }
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center border-b bg-background px-3 lg:pl-[15rem] lg:pr-5">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={openMenu} aria-label="Abrir menú"><Menu className="size-5" /></Button>
      <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Volver"><ChevronLeft className="size-4" /></Button>
      <div className="ml-2 text-sm font-semibold">{label}</div>
      <div className="ml-auto flex items-center gap-1">
        <Link href="/notificaciones" className="grid size-11 place-items-center rounded-lg hover:bg-muted" aria-label="Notificaciones"><Bell className="size-4" /></Link>
        <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Cambiar tema">
          {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
        <Link
          href="/configuracion"
          className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Editar foto de perfil"
          title="Editar perfil"
        >
          <Avatar
            name={user.data?.data.name ?? "Administrador"}
            src={user.data?.data.avatarUrl}
          />
        </Link>
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Cerrar sesión"><LogOut className="size-4" /></Button>
      </div>
    </header>
  );
}
