"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
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
  selectedOption?: SearchableSelectOption;
  onSearchChange?: (search: string) => void;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
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
  selectedOption,
  onSearchChange,
  loading = false,
  error = false,
  onRetry,
  hasMore = false,
  onLoadMore,
}: SearchableSelectProps) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const selected = selectedOption?.value === value ? selectedOption : options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const term = normalize(query);
    if (onSearchChange || !term || selected?.label === query) return options;
    return options.filter((option) =>
      normalize([option.label, ...(option.keywords ?? [])].join(" ")).includes(term),
    );
  }, [options, query, selected?.label, onSearchChange]);

  useEffect(() => {
    if (!open) setQuery(selected?.label ?? "");
  }, [open, selected?.label]);

  useEffect(() => {
    if (open) document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, listId]);

  function select(option: SearchableSelectOption) {
    onChange(option.value);
    setQuery(option.label);
    setOpen(false);
  }

  return (
    <div className={cn("relative", className)} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && !loading && filtered[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          value={query}
          placeholder={open ? searchPlaceholder : placeholder}
          className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          onClick={() => {
            setOpen(true);
            setActiveIndex(0);
            onSearchChange?.(selected?.label === query ? "" : query);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(0);
            onSearchChange?.(event.target.value);
            if (value) onChange("");
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              if (!open) onSearchChange?.(selected?.label === query ? "" : query);
              if (open && activeIndex === filtered.length - 1 && hasMore && !loading) onLoadMore?.();
              setActiveIndex((current) =>
                open ? Math.max(0, Math.min(current + 1, filtered.length - 1)) : 0,
              );
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((current) => Math.max(current - 1, 0));
            } else if (event.key === "Enter" && open && !loading && !error && filtered[activeIndex]) {
              event.preventDefault();
              select(filtered[activeIndex]);
            } else if (event.key === "Enter" && !open) {
              event.preventDefault();
              setOpen(true);
              setActiveIndex(0);
              onSearchChange?.(selected?.label === query ? "" : query);
            } else if (event.key === "Escape") {
              if (open) event.stopPropagation();
              setOpen(false);
            }
          }}
        />
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      <AnimatePresence>
      {open && (
        <motion.div className="absolute z-[60] mt-1 max-h-56 w-full origin-top overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md" initial={{ opacity: 0, y: -4, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -2, scale: 0.995 }} transition={{ duration: 0.14 }}>
          <div id={listId} role="listbox" aria-label={ariaLabel} aria-busy={loading}>
          {!error && filtered.map((option, index) => (
            <button
              id={`${listId}-${index}`}
              key={option.value}
              type="button"
              tabIndex={-1}
              disabled={loading}
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
          ))}
          </div>
          <div role="status" className="text-center text-sm text-muted-foreground">
            {loading ? <p className="p-3">Buscando...</p> : error ? <p className="p-3">No se pudieron cargar las opciones.</p> : !filtered.length ? <p className="p-3">{emptyMessage}</p> : null}
          </div>
          {error && onRetry && <button type="button" className="min-h-11 w-full rounded-md text-sm underline" onMouseDown={(event) => event.preventDefault()} onClick={() => { inputRef.current?.focus(); onRetry(); }}>Reintentar</button>}
          {!error && hasMore && <button type="button" disabled={loading} className="min-h-11 w-full rounded-md text-sm hover:bg-muted" onMouseDown={(event) => event.preventDefault()} onClick={() => { inputRef.current?.focus(); onLoadMore?.(); }}>Cargar más resultados</button>}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
