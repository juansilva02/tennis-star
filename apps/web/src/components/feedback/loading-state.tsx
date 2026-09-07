import { cn } from "@/lib/utils";

export function LoadingState({
  className,
  label = "Cargando",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn("h-64 animate-pulse rounded-xl bg-muted/40", className)}
      role="status"
      aria-label={label}
    />
  );
}
