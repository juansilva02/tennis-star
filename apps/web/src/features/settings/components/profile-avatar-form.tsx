"use client";

import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  getCurrentUser,
  removeProfileAvatar,
  uploadProfileAvatar,
} from "@/features/auth/api/auth-api";
import { getErrorMessage } from "@/lib/errors";

const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];

export function ProfileAvatarForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const user = useQuery({ queryKey: ["me"], queryFn: getCurrentUser });
  const updateCache = (data: Awaited<ReturnType<typeof getCurrentUser>>) => {
    queryClient.setQueryData(["me"], data);
  };
  const upload = useMutation({
    mutationFn: uploadProfileAvatar,
    onSuccess: (data) => {
      updateCache(data);
      toast.success("Foto de perfil actualizada");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: removeProfileAvatar,
    onSuccess: (data) => {
      updateCache(data);
      toast.success("Foto de perfil eliminada");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
  const current = user.data?.data;
  if (!current) return null;

  function selectFile(file?: File) {
    if (!file) return;
    if (!acceptedTypes.includes(file.type) || file.size > 2 * 1024 * 1024) {
      toast.error("Seleccioná una imagen JPG, PNG o WebP de hasta 2 MB");
      return;
    }
    upload.mutate(file);
  }

  return (
    <div className="flex flex-col gap-4 border-b pb-5 sm:col-span-2 sm:flex-row sm:items-center">
      <Avatar
        name={current.name}
        src={current.avatarUrl}
        className="size-20 text-xl"
      />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Foto de perfil</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Se mostrará en el encabezado del panel. JPG, PNG o WebP, máximo 2 MB.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={upload.isPending || remove.isPending}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="size-4" />
            {upload.isPending ? "Subiendo..." : "Cambiar foto"}
          </Button>
          {current.avatarUrl && (
            <Button
              type="button"
              variant="ghost"
              disabled={upload.isPending || remove.isPending}
              onClick={() => remove.mutate()}
            >
              <Trash2 className="size-4" />
              Quitar foto
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label="Seleccionar foto de perfil"
          onChange={(event) => {
            selectFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
