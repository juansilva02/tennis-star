import * as React from "react";
import { cn } from "@/lib/utils";
export function Badge({
  className,
  variant = "default",
  ...p
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "danger" | "outline";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        {
          default: "bg-muted text-foreground",
          success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
          warning: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
          danger: "bg-red-500/15 text-red-700 dark:text-red-300",
          outline: "border border-border",
        }[variant],
        className,
      )}
      {...p}
    />
  );
}
