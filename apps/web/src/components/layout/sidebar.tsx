"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigationItems } from "./navigation";

export function Sidebar({
  className,
}: {
  className?: string;
}) {
  const path = usePathname();
  return (
    <aside className={cn("flex h-full w-56 flex-col bg-background", className)}>
      <div className="flex h-14 items-center border-b px-4 text-base font-bold">Tennis Star</div>
      <nav aria-label="Navegación principal" className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {navigationItems.map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
              path === href && "bg-muted font-medium text-foreground",
            )}
          >
            <Icon className="size-4" /><span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
