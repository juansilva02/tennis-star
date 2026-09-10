"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/lib/use-debounced-value";
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

export function useSaleCustomers(search: string) {
  const term = useDebouncedValue(search);
  const result = useInfiniteQuery({
    queryKey: ["customers-sale", term],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => getSaleCustomers(term, pageParam, signal),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
  return { ...result, searching: search !== term || result.isFetching };
}

export function useSaleProducts(search: string) {
  const term = useDebouncedValue(search);
  const result = useInfiniteQuery({
    queryKey: ["products-sale", term],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => getSaleProducts(term, pageParam, signal),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
  return { ...result, searching: search !== term || result.isFetching };
}
