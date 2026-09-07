"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getSaleCustomers,
  getSaleProducts,
  getSales,
  getTodaySalesSummary,
} from "@/features/sales/api/sales-api";

export function useSales(search: string, hidden: boolean, page: number) {
  return useQuery({
    queryKey: ["sales", search, hidden, page],
    queryFn: () => getSales(search, hidden, page),
  });
}

export function useTodaySalesSummary() {
  return useQuery({
    queryKey: ["sales", "summary", "today"],
    queryFn: getTodaySalesSummary,
  });
}

export function useSaleOptions() {
  const customers = useQuery({
    queryKey: ["customers-sale"],
    queryFn: getSaleCustomers,
  });
  const products = useQuery({
    queryKey: ["products-sale"],
    queryFn: getSaleProducts,
  });
  return { customers, products };
}
