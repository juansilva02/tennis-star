"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProductImageFieldProps {
  currentUrl?: string | null;
  file: File | null;
  altText: string;
  onFileChange: (file: File | null) => void;
  onAltTextChange: (value: string) => void;
}

export function ProductImageField({
  currentUrl,
  file,
  altText,
  onFileChange,
  onAltTextChange,
}: ProductImageFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const preview = previewUrl ?? currentUrl;

  return (
    <fieldset className="rounded-xl border border-border bg-muted/25 p-4 sm:col-span-2">
      <legend className="px-1 text-sm font-medium">Imagen principal</legend>
      <div className="mt-2 grid gap-4 sm:grid-cols-[112px_1fr]">
        <div className="relative grid aspect-square place-items-center overflow-hidden rounded-xl border bg-background text-muted-foreground">
          {preview ? (
            <Image
              src={preview}
              alt={altText || "Vista previa del producto"}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <ImagePlus className="size-7" aria-hidden="true" />
          )}
        </div>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="product-image"
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted focus-within:ring-2 focus-within:ring-ring"
            >
              <ImagePlus className="size-4" aria-hidden="true" />
              {file ? "Cambiar archivo" : currentUrl ? "Reemplazar imagen" : "Seleccionar imagen"}
              <input
                id="product-image"
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
              />
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG o WebP de hasta 5 MB. Se convertirá a WebP, calidad 80 y máximo 800 px.
            </p>
            {file ? (
              <p className="mt-1 truncate text-xs font-medium">{file.name}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="product-image-alt" className="mb-2 block text-sm font-medium">
              Texto alternativo
            </label>
            <Input
              id="product-image-alt"
              value={altText}
              onChange={(event) => onAltTextChange(event.target.value)}
              placeholder="Describe brevemente el producto"
            />
          </div>
        </div>
      </div>
    </fieldset>
  );
}
