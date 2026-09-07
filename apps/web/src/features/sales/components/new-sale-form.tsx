"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createSale } from "@/features/sales/api/sales-api";
import { useSaleOptions } from "@/features/sales/hooks/use-sales";
import type {
  PaymentMethod,
  SaleCustomer,
  SaleLineInput,
  SaleProduct,
} from "@/features/sales/types";
import { getErrorMessage } from "@/lib/errors";
import { money } from "@/lib/utils";

const emptyLine: SaleLineInput = { productId: "", quantity: 1 };
const emptyProducts: SaleProduct[] = [];
const emptyCustomers: SaleCustomer[] = [];

export function NewSaleForm({ onDone }: { onDone: () => void }) {
  const { customers, products } = useSaleOptions();
  const [customerId, setCustomerId] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("CREDIT_CARD");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<SaleLineInput[]>([emptyLine]);
  const productList = products.data?.data ?? emptyProducts;
  const customerList = customers.data?.data ?? emptyCustomers;
  const productsById = useMemo(
    () => new Map(productList.map((product) => [product.id, product])),
    [productList],
  );
  const customersById = useMemo(
    () => new Map(customerList.map((customer) => [customer.id, customer])),
    [customerList],
  );
  const customerOptions = useMemo(
    () =>
      customerList.map((customer) => ({
        value: customer.id,
        label: customer.name,
        keywords: [
          customer.id,
          customer.address ?? "",
          customer.city ?? "",
          customer.postalCode ?? "",
        ],
      })),
    [customerList],
  );
  const productOptions = useMemo(
    () =>
      productList.map((product) => ({
        value: product.id,
        label: `${product.name} — ${money.format(Number(product.price))}`,
        keywords: [product.id, product.sku, product.name],
      })),
    [productList],
  );
  const total = items.reduce(
    (sum, item) =>
      sum + Number(productsById.get(item.productId)?.price ?? 0) * item.quantity,
    0,
  );

  const create = useMutation({
    mutationFn: () =>
      createSale({
        customerId,
        paymentMethod: method,
        shippingAddress: address,
        notes,
        items,
      }),
    onSuccess: () => {
      toast.success("Venta registrada");
      onDone();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  function chooseCustomer(id: string) {
    setCustomerId(id);
    const customer = customersById.get(id);
    if (customer) {
      setAddress(
        [customer.address, customer.city, customer.postalCode]
          .filter(Boolean)
          .join(", "),
      );
    }
  }

  function updateLine(index: number, patch: Partial<SaleLineInput>) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  return (
    <div className="mt-5 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Cliente
          <SearchableSelect
            value={customerId}
            onChange={chooseCustomer}
            options={customerOptions}
            placeholder="Seleccionar cliente"
            searchPlaceholder="Buscar por nombre, ID o dirección"
            emptyMessage="No se encontraron clientes."
            ariaLabel="Buscar cliente por nombre, ID o dirección"
            className="mt-2"
          />
        </label>
        <label className="text-sm font-medium">
          Método de pago
          <Select
            value={method}
            onValueChange={(value) => setMethod(value as PaymentMethod)}
            ariaLabel="Método de pago"
            className="mt-2"
            options={[
              { value: "CREDIT_CARD", label: "Tarjeta de crédito" },
              { value: "DEBIT_CARD", label: "Tarjeta de débito" },
              { value: "CASH", label: "Efectivo" },
              { value: "BANK_TRANSFER", label: "Transferencia" },
            ]}
          />
        </label>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">Productos</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setItems((current) => [...current, { ...emptyLine }])
            }
          >
            <Plus className="size-4" />
            Agregar
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-[1fr_88px_44px] gap-2">
              <SearchableSelect
                value={item.productId}
                onChange={(productId) => updateLine(index, { productId })}
                options={productOptions}
                placeholder="Seleccionar producto"
                searchPlaceholder="Buscar por SKU, ID o nombre"
                emptyMessage="No se encontraron productos."
                ariaLabel={`Buscar producto ${index + 1} por SKU, ID o nombre`}
                className="min-w-0"
              />
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(event) =>
                  updateLine(index, { quantity: Number(event.target.value) })
                }
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setItems((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                aria-label="Quitar producto"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      <label className="block text-sm font-medium">
        Dirección de envío
        <Input
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          className="mt-2"
        />
      </label>
      <label className="block text-sm font-medium">
        Notas opcionales
        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="mt-2"
        />
      </label>
      <div className="flex items-center justify-between border-t pt-4">
        <div>
          <p className="text-xs text-muted-foreground">Total estimado</p>
          <p className="font-mono text-xl font-semibold">
            {money.format(total)}
          </p>
        </div>
        <Button
          onClick={() => create.mutate()}
          disabled={
            !customerId ||
            !address ||
            items.some((item) => !item.productId) ||
            create.isPending
          }
        >
          <ShoppingCart className="size-4" />
          {create.isPending ? "Generando..." : "Generar venta"}
        </Button>
      </div>
    </div>
  );
}
