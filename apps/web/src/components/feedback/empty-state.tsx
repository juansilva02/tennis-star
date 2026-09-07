import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  className,
}: {
  title?: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid min-h-40 place-items-center p-8 text-center",
        className,
      )}
    >
      <div>
        {title ? <p className="font-medium">{title}</p> : null}
        <p className={cn("text-sm text-muted-foreground", title && "mt-1")}>
          {description}
        </p>
      </div>
    </div>
  );
}
