"use client";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { getCurrentUser } from "@/features/auth/api/auth-api";
import { ApiError } from "@/lib/api/client";
import { ErrorState } from "@/components/feedback/error-state";
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const q = useQuery({
    queryKey: ["me"],
    queryFn: getCurrentUser,
    retry: false,
  });
  useEffect(() => {
    if (q.error instanceof ApiError && q.error.status === 401) router.replace(`/login?next=${encodeURIComponent(path)}`);
  }, [q.error, path, router]);
  if (q.isPending)
    return (
      <div className="grid min-h-dvh place-items-center">
        <div
          className="size-8 animate-spin rounded-full border-2 border-muted border-t-foreground"
          aria-label="Cargando"
        />
      </div>
    );
  if (q.isError) return q.error instanceof ApiError && q.error.status === 401 ? null : <ErrorState message="No se pudo verificar la sesión. Volvé a intentar." onRetry={() => void q.refetch()} />;
  return children;
}
