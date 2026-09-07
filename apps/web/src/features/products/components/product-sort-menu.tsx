"use client";

import { useState } from "react";
import { Check, ListFilter } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "createdAt:desc", label: "Más recientes" },
  { value: "name:asc", label: "Nombre A–Z" },
  { value: "price:asc", label: "Menor precio" },
  { value: "price:desc", label: "Mayor precio" },
  { value: "stock:desc", label: "Mayor stock" },
];

export function ProductSortMenu({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = sortOptions.find((option) => option.value === value);

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <Button
        type="button"
        variant="outline"
        aria-label="Ordenar productos"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      >
        <ListFilter className="size-4" />
        {current?.label ?? "Ordenar"}
      </Button>
      <AnimatePresence>
      {open && (
        <motion.div
          role="menu"
          className="absolute right-0 z-40 mt-1 min-w-48 origin-top-right rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -2, scale: 0.99 }}
          transition={{ duration: 0.14 }}
        >
          {sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={option.value === value}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted",
                option.value === value && "bg-muted",
              )}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span className="flex-1">{option.label}</span>
              {option.value === value && <Check className="size-4" />}
            </button>
          ))}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
