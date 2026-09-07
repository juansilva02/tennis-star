import * as React from "react";
import { cn } from "@/lib/utils";
export function Table({
  className,
  ...p
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full text-sm", className)} {...p} />
    </div>
  );
}
export const TableHeader = (
  p: React.HTMLAttributes<HTMLTableSectionElement>,
) => <thead className="border-b bg-muted/30" {...p} />;
export const TableBody = (p: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody {...p} />
);
export const TableRow = ({
  className,
  ...p
}: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={cn("border-b transition-colors hover:bg-muted/35", className)}
    {...p}
  />
);
export const TableHead = ({
  className,
  scope = "col",
  ...p
}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    scope={scope}
    className={cn(
      "h-11 px-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",
      className,
    )}
    {...p}
  />
);
export const TableCell = ({
  className,
  ...p
}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("px-4 py-3 align-middle", className)} {...p} />
);
