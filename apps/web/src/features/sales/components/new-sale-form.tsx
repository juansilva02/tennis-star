"use client";

import { useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMutation } from "@tanstack/react-query";
import { BadgePercent, Check, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createSale,
  previewSaleDiscount,
} from "@/features/sales/api/sales-api";
import { useSaleOptions } from "@/features/sales/hooks/use-sales";
import type {
  DiscountPreview,
  PaymentMethod,
  SaleCustomer,
  SaleLineInput,
  SaleProduct,
} from "@/features/sales/types";
import { getErrorMessage } from "@/lib/errors";
import { money } from "@/lib/utils";

type DraftSaleLine = SaleLineInput & { clientId: string };

const emptyLine: SaleLineInput = { productId: "", quantity: 1 };

function newDraftLine(clientId: string): DraftSaleLine {
  return { ...emptyLine, clientId };
}
const emptyProducts: SaleProduct[] = [];
const emptyCustomers: SaleCustomer[] = [];

export function NewSaleForm({ onDone }: { onDone: () => void }) {
  const { customers, products } = useSaleOptions();
  const [customerId, setCustomerId] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("CREDIT_CARD");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] =
    useState<DiscountPreview | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [items, setItems] = useState<DraftSaleLine[]>(() => [
    { ...emptyLine, clientId: "initial-line" },
  ]);
  const lineIdPrefix = useId();
  const nextLineId = useRef(0);
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
  const subtotal = items.reduce(
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
        discountCode: appliedDiscount?.code,
        items: items.map(({ clientId: _clientId, ...item }) => item),
      }),
    onSuccess: () => {
      toast.success("Venta registrada");
      onDone();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const previewDiscount = useMutation({
    mutationFn: () =>
      previewSaleDiscount({
        discountCode,
        items: items.map(({ clientId: _clientId, ...item }) => item),
      }),
    onMutate: () => setDiscountError(""),
    onSuccess: ({ data }) => {
      setDiscountCode(data.code);
      setAppliedDiscount(data);
    },
    onError: (error) => {
      setAppliedDiscount(null);
      setDiscountError(getErrorMessage(error));
    },
  });

  const total = appliedDiscount ? Number(appliedDiscount.total) : subtotal;

  function clearAppliedDiscount() {
    setAppliedDiscount(null);
    setDiscountError("");
  }

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

  function updateLine(clientId: string, patch: Partial<SaleLineInput>) {
    clearAppliedDiscount();
    setItems((current) =>
      current.map((item) =>
        item.clientId === clientId ? { ...item, ...patch } : item,
      ),
    );
  }

  function addLine() {
    clearAppliedDiscount();
    nextLineId.current += 1;
    setItems((current) => [
      ...current,
      newDraftLine(lineIdPrefix + "-" + nextLineId.current),
    ]);
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
            onClick={addLine}
          >
            <Plus className="size-4" />
            Agregar
          </Button>
        </div>
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {items.map((item, index) => (
              <motion.div
                key={item.clientId}
                layout
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="grid grid-cols-[1fr_88px_44px] gap-2"
              >
                <SearchableSelect
                  value={item.productId}
                  onChange={(productId) =>
                    updateLine(item.clientId, { productId })
                  }
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
                    updateLine(item.clientId, {
                      quantity: Number(event.target.value),
                    })
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    clearAppliedDiscount();
                    setItems((current) =>
                      current.filter(
                        (line) => line.clientId !== item.clientId,
                      ),
                    );
                  }}
                  aria-label="Quitar producto"
                >
                  <Trash2 className="size-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="sale-discount-code" className="text-sm font-medium">
          Código de descuento
        </label>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <div className="relative min-w-0">
            <BadgePercent
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="sale-discount-code"
              value={discountCode}
              onChange={(event) => {
                setDiscountCode(event.target.value.toUpperCase());
                clearAppliedDiscount();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && discountCode.trim()) {
                  event.preventDefault();
                  previewDiscount.mutate();
                }
              }}
              placeholder="Ingresar código"
              autoComplete="off"
              className="pl-9 uppercase"
              aria-describedby="sale-discount-feedback"
              aria-invalid={Boolean(discountError)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => previewDiscount.mutate()}
            disabled={
              !discountCode.trim() ||
              !items.length ||
              items.some((item) => !item.productId || item.quantity < 1) ||
              previewDiscount.isPending
            }
          >
            {previewDiscount.isPending ? "Validando..." : "Aplicar"}
          </Button>
        </div>
        <div id="sale-discount-feedback" aria-live="polite">
          {discountError ? (
            <p className="text-sm text-destructive">{discountError}</p>
          ) : appliedDiscount ? (
            <div className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm">
              <p className="flex min-w-0 items-center gap-2 text-emerald-400">
                <Check aria-hidden="true" className="size-4 shrink-0" />
                <span className="truncate">
                  {appliedDiscount.name}: −
                  {money.format(Number(appliedDiscount.discountAmount))}
                </span>
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 shrink-0"
                onClick={() => {
                  setDiscountCode("");
                  clearAppliedDiscount();
                }}
                aria-label="Quitar código de descuento"
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : discountCode.trim() ? (
            <p className="text-xs text-muted-foreground">
              Aplicá el código para validar su vigencia y actualizar el total.
            </p>
          ) : null}
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
          {appliedDiscount && (
            <p className="text-xs text-muted-foreground">
              Subtotal {money.format(subtotal)} · Descuento −
              {money.format(Number(appliedDiscount.discountAmount))}
            </p>
          )}
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
            !items.length ||
            items.some((item) => !item.productId || item.quantity < 1) ||
            (Boolean(discountCode.trim()) && !appliedDiscount) ||
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
