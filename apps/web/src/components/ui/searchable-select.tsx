"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface SearchableSelectOption {
  value: string;
  label: string;
  keywords?: string[];
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage?: string;
  className?: string;
  ariaLabel?: string;
}

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage = "No se encontraron resultados.",
  className,
  ariaLabel,
}: SearchableSelectProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const term = normalize(query);
    if (!term || selected?.label === query) return options;
    return options.filter((option) =>
      normalize([option.label, ...(option.keywords ?? [])].join(" ")).includes(term),
    );
  }, [options, query, selected?.label]);

  useEffect(() => {
    if (!open) setQuery(selected?.label ?? "");
  }, [open, selected?.label]);

  function select(option: SearchableSelectOption) {
    onChange(option.value);
    setQuery(option.label);
    setOpen(false);
  }

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && filtered[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          value={query}
          placeholder={open ? searchPlaceholder : placeholder}
          className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          onClick={() => {
            setOpen(true);
            setActiveIndex(0);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 100)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(0);
            if (value) onChange("");
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) =>
                open ? Math.min(current + 1, filtered.length - 1) : 0,
              );
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) => Math.max(current - 1, 0));
            } else if (event.key === "Enter" && open && filtered[activeIndex]) {
              event.preventDefault();
              select(filtered[activeIndex]);
            } else if (event.key === "Enter" && !open) {
              event.preventDefault();
              setOpen(true);
              setActiveIndex(0);
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
        />
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      <AnimatePresence>
      {open && (
        <motion.div id={listId} role="listbox" className="absolute z-[60] mt-1 max-h-56 w-full origin-top overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md" initial={{ opacity: 0, y: -4, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -2, scale: 0.995 }} transition={{ duration: 0.14 }}>
          {filtered.length ? filtered.map((option, index) => (
            <button
              id={`${listId}-${index}`}
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={cn("flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted", index === activeIndex && "bg-muted")}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => select(option)}
            >
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              {option.value === value && <Check className="size-4 shrink-0" />}
            </button>
          )) : <p className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyMessage}</p>}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
