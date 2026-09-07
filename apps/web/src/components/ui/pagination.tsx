import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({
  meta,
  onPage,
}: {
  meta?: { page: number; pageCount: number; total: number };
  onPage: (page: number) => void;
}) {
  if (!meta || meta.pageCount <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
      <span className="text-muted-foreground">
        {meta.total} registros · Página {meta.page} de {meta.pageCount}
      </span>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={meta.page <= 1}
          onClick={() => onPage(meta.page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={meta.page >= meta.pageCount}
          onClick={() => onPage(meta.page + 1)}
          aria-label="Página siguiente"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
