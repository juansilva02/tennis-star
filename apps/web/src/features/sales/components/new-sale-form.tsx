"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMutation } from "@tanstack/react-query";
import { BadgePercent, Check, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SaleCustomerSelect, SaleProductSelect } from "./sale-option-select";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createSale,
  previewSaleDiscount,
} from "@/features/sales/api/sales-api";
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

export function NewSaleForm({ onDone }: { onDone: () => void }) {
  const [customer, setCustomer] = useState<SaleCustomer>();
  const customerId = customer?.id ?? "";
  const [productsById, setProductsById] = useState(() => new Map<string, SaleProduct>());
  const discountRevision = useRef(0);
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
    mutationFn: (_revision: number) =>
      previewSaleDiscount({
        discountCode,
        items: items.map(({ clientId: _clientId, ...item }) => item),
      }),
    onMutate: () => setDiscountError(""),
    onSuccess: ({ data }, revision) => {
      if (revision !== discountRevision.current) return;
      setDiscountCode(data.code);
      setAppliedDiscount(data);
    },
    onError: (error, revision) => {
      if (revision !== discountRevision.current) return;
      setAppliedDiscount(null);
      setDiscountError(getErrorMessage(error));
    },
  });

  const total = appliedDiscount ? Number(appliedDiscount.total) : subtotal;

  function clearAppliedDiscount() {
    discountRevision.current += 1;
    setAppliedDiscount(null);
    setDiscountError("");
  }

  function chooseCustomer(customer?: SaleCustomer) {
    setCustomer(customer);
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
          <SaleCustomerSelect selected={customer} onSelect={chooseCustomer} />
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
            disabled={items.length >= 100}
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
                layout="position"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="grid grid-cols-[1fr_88px_44px] gap-2"
              >
                <SaleProductSelect
                  selected={productsById.get(item.productId)}
                  index={index}
                  onSelect={(product) => {
                    if (product) setProductsById((current) => new Map(current).set(product.id, product));
                    updateLine(item.clientId, { productId: product?.id ?? "" });
                  }}
                />
                <Input
                  type="number"
                  aria-label={`Cantidad del producto ${index + 1}`}
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
                if (event.key === "Enter" && discountCode.trim() && !previewDiscount.isPending) {
                  event.preventDefault();
                  previewDiscount.mutate(discountRevision.current);
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
            onClick={() => previewDiscount.mutate(discountRevision.current)}
            disabled={
              !discountCode.trim() ||
              !items.length ||
              items.some((item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 1000000) ||
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
            items.some((item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 1000000) ||
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
