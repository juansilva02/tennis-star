"use client";

import { ArchiveRestore, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SalesFilters({
  search,
  hidden,
  onSearchChange,
  onHiddenChange,
}: {
  search: string;
  hidden: boolean;
  onSearchChange: (value: string) => void;
  onHiddenChange: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por orden o cliente"
          className="pl-9"
        />
      </div>
      <Button
        variant={hidden ? "default" : "outline"}
        onClick={() => onHiddenChange(!hidden)}
      >
        <ArchiveRestore className="size-4" />
        {hidden ? "Ver ventas activas" : "Ver ventas ocultas"}
      </Button>
    </div>
  );
}
