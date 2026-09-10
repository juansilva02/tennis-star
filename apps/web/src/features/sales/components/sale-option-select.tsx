"use client";

import { useState } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useSaleCustomers, useSaleProducts } from "../hooks/use-sales";
import type { SaleCustomer, SaleProduct } from "../types";
import { money } from "@/lib/utils";

const customerOption = (customer: SaleCustomer) => ({ value: customer.id, label: `${customer.name} — ${customer.email}` });
const productOption = (product: SaleProduct) => ({ value: product.id, label: `${product.name} · ${product.sku} — ${money.format(Number(product.price))}` });

export function SaleCustomerSelect({ selected, onSelect }: { selected?: SaleCustomer; onSelect: (customer?: SaleCustomer) => void }) {
  const [search, setSearch] = useState("");
  const query = useSaleCustomers(search);
  const rows = query.data?.pages.flatMap((page) => page.data) ?? [];
  return <SearchableSelect
    value={selected?.id ?? ""} selectedOption={selected && customerOption(selected)}
    options={rows.map(customerOption)} onChange={(id) => onSelect(rows.find((row) => row.id === id))}
    onSearchChange={setSearch} loading={query.searching} error={query.isError}
    onRetry={() => void query.refetch()} hasMore={query.hasNextPage} onLoadMore={() => void query.fetchNextPage()}
    placeholder="Seleccionar cliente" searchPlaceholder="Buscar por nombre, ID o dirección"
    ariaLabel="Buscar cliente por nombre, ID o dirección" className="mt-2"
  />;
}

export function SaleProductSelect({ selected, onSelect, index }: { selected?: SaleProduct; onSelect: (product?: SaleProduct) => void; index: number }) {
  const [search, setSearch] = useState("");
  const query = useSaleProducts(search);
  const rows = query.data?.pages.flatMap((page) => page.data) ?? [];
  return <SearchableSelect
    value={selected?.id ?? ""} selectedOption={selected && productOption(selected)}
    options={rows.map(productOption)} onChange={(id) => onSelect(rows.find((row) => row.id === id))}
    onSearchChange={setSearch} loading={query.searching} error={query.isError}
    onRetry={() => void query.refetch()} hasMore={query.hasNextPage} onLoadMore={() => void query.fetchNextPage()}
    placeholder="Seleccionar producto" searchPlaceholder="Buscar por SKU, ID o nombre"
    ariaLabel={`Buscar producto ${index + 1} por SKU, ID o nombre`} className="min-w-0"
  />;
}
