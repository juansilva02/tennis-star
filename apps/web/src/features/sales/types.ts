import type { Product } from "@/features/products/types";

export type SaleStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";
export type PaymentMethod =
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "CASH"
  | "BANK_TRANSFER";

export interface SaleCustomer {
  id: string;
  name: string;
  email: string;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: string;
  quantity: number;
  subtotal: string;
}

export interface SaleStatusHistory {
  id: string;
  from?: SaleStatus | null;
  to: SaleStatus;
  note?: string | null;
  createdAt: string;
}

export interface Sale {
  id: string;
  orderNumber: string;
  status: SaleStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  total: string;
  shippingAddress: string;
  trackingId?: string | null;
  notes?: string | null;
  createdAt: string;
  customer: SaleCustomer;
  items: SaleItem[];
  history: SaleStatusHistory[];
}

export interface TodaySalesSummary {
  count: number;
  total: string;
  from: string;
  to: string;
}

export interface SaleLineInput {
  productId: string;
  quantity: number;
}

export interface CreateSaleInput {
  customerId: string;
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  notes: string;
  items: SaleLineInput[];
}

export interface UpdateSaleInput {
  status: SaleStatus;
  paymentStatus: PaymentStatus;
  trackingId: string;
  shippingAddress: string;
  statusNote: string;
}

export type SaleProduct = Pick<Product, "id" | "sku" | "name" | "price">;
