"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/feedback/error-state";

export default function PanelError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorState message="Ocurrió un error al mostrar esta sección." onRetry={reset} />;
}
