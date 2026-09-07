import { LoadingState } from "@/components/feedback/loading-state";

export default function PanelLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <LoadingState className="h-8 max-w-56 rounded-lg" label="Cargando encabezado" />
      <LoadingState className="h-80" label="Cargando contenido" />
    </div>
  );
}
