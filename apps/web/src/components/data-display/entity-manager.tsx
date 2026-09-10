"use client";
import { invalidateDomain } from "@/lib/api/invalidate-domain";
import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, Plus, Search, Trash2, ArchiveRestore } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { MotionTableRow } from "@/components/motion/motion-primitives";
import { EntityForm } from "./entity-form";
import { getEntities, removeEntity, saveEntity } from "./entity-manager-api";
import type { Column, EntityRow, Field } from "./entity-manager.types";
export type { Column, Field } from "./entity-manager.types";
export function EntityManager({
  title,
  description,
  resource,
  fields,
  columns,
  createLabel = "Nuevo",
  archive = false,
}: {
  title: string;
  description: string;
  resource: string;
  fields: Field[];
  columns: Column[];
  createLabel?: string;
  archive?: boolean;
}) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<EntityRow | null>(null);
  const [confirmRow, setConfirmRow] = useState<EntityRow | null>(null);
  const [open, setOpen] = useState(false);
  const q = useQuery({
    queryKey: [resource, search, showArchived, page],
    queryFn: () => getEntities(resource, search, page, archive, showArchived),
  });
  const rows = q.data?.data ?? [];
  const mutation = useMutation({
    mutationFn: ({ data, id }: { data: Record<string, unknown>; id?: string }) => saveEntity(resource, data, id),
    onSuccess: () => {
      toast.success(editing ? "Cambios guardados" : "Registro creado");
      setOpen(false);
      setEditing(null);
      invalidateDomain(qc, resource);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  function start(row?: EntityRow) {
    setEditing(row ?? null);
    setOpen(true);
  }
  async function remove(row: EntityRow) {
    try {
      await removeEntity(resource, row.id, archive && showArchived);
      toast.success(
        archive
          ? showArchived
            ? "Registro restaurado"
            : "Registro archivado"
          : "Registro eliminado",
      );
      setConfirmRow(null);
      invalidateDomain(qc, resource);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <PageHeader title={title} description={description}>
        <Button onClick={() => start()}>
          <Plus className="size-4" />
          {createLabel}
        </Button>
      </PageHeader>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={`Buscar en ${title.toLowerCase()}...`}
            className="pl-9"
          />
        </div>
        {search && (
          <Button variant="ghost" onClick={() => setSearch("")}>
            Limpiar filtros
          </Button>
        )}
        {archive && (
          <Button
            variant={showArchived ? "default" : "outline"}
            onClick={() => { setShowArchived(!showArchived); setPage(1); }}
          >
            <ArchiveRestore className="size-4" />
            {showArchived ? "Ver activos" : "Ver archivados"}
          </Button>
        )}
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        {q.isPending ? (
          <LoadingState className="rounded-none" />
        ) : q.isError ? (
          <ErrorState message="No se pudo cargar la información." onRetry={() => q.refetch()} />
        ) : rows.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead
                    key={c.key}
                    className={c.hideMobile ? "hidden md:table-cell" : ""}
                  >
                    {c.label}
                  </TableHead>
                ))}
                <TableHead className="w-28 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
              {rows.map((row) => (
                <MotionTableRow key={row.id}>
                  {columns.map((c) => (
                    <TableCell
                      key={c.key}
                      className={c.hideMobile ? "hidden md:table-cell" : ""}
                    >
                      {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => start(row)}
                        aria-label="Editar"
                      >
                        <Edit3 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setConfirmRow(row)}
                        aria-label={
                          archive
                            ? showArchived
                              ? "Restaurar"
                              : "Archivar"
                            : "Eliminar"
                        }
                      >
                        {archive ? (
                          <ArchiveRestore className="size-4" />
                        ) : (
                          <Trash2 className="size-4 text-red-600" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </MotionTableRow>
              ))}
            </AnimatePresence>
            </TableBody>
          </Table>
        ) : (
          <EmptyState title="Todavía no hay registros" description="Creá el primero para comenzar." className="min-h-64" />
        )}
        <Pagination meta={q.data?.meta} onPage={setPage} />
      </div>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogTitle>
            {editing ? `Editar ${title.toLowerCase()}` : createLabel}
          </DialogTitle>
          <DialogDescription>
            Completá los campos y guardá los cambios.
          </DialogDescription>
          <EntityForm
            fields={fields}
            initial={editing}
            busy={mutation.isPending}
            onSubmit={(data) => mutation.mutate({ data, id: editing?.id })}
          />
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!confirmRow}
        onOpenChange={(value) => !value && setConfirmRow(null)}
        title={
          archive
            ? showArchived
              ? "Restaurar registro"
              : "Archivar registro"
            : "Eliminar registro"
        }
        description={
          archive
            ? showArchived
              ? "El registro volverá a aparecer entre los elementos activos."
              : "El registro quedará archivado y podrás restaurarlo más adelante."
            : "Esta acción es permanente y no se puede deshacer."
        }
        actionLabel={
          archive ? (showArchived ? "Restaurar" : "Archivar") : "Eliminar"
        }
        destructive={!archive}
        onConfirm={() => {
          if (confirmRow) return remove(confirmRow);
        }}
      />
    </div>
  );
}
