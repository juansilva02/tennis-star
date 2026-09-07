import type { ReactNode } from "react";

export type EntityRow = Record<string, any> & { id: string };

export type Field = {
  key: string;
  label: string;
  type?: "text" | "email" | "number" | "textarea" | "select" | "boolean" | "date" | "tags";
  required?: boolean;
  options?: { value: string; label: string }[];
  money?: boolean;
  placeholder?: string;
};

export type Column = {
  key: string;
  label: string;
  render?: (row: EntityRow) => ReactNode;
  hideMobile?: boolean;
};
