"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/utils";
import { buildStatisticsCsv, statisticsFilename } from "../lib/statistics-export";
import type { StatisticsData } from "../types";

interface StatisticsReportExportProps {
  data?: StatisticsData;
  periodLabel: string;
  loading?: boolean;
}

function downloadBlob(content: BlobPart, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function StatisticsReportExport({
  data,
  periodLabel,
  loading,
}: StatisticsReportExportProps) {
  const [exportingPdf, setExportingPdf] = useState(false);
  const disabled = loading || !data;

  function exportCsv() {
    if (!data) return;
    downloadBlob(
      buildStatisticsCsv(data, periodLabel),
      "text/csv;charset=utf-8",
      statisticsFilename(periodLabel, "csv"),
    );
    toast.success("Informe CSV exportado");
  }

  async function exportPdf() {
    if (!data) return;
    setExportingPdf(true);
    try {
      const { jsPDF } = await import("jspdf");
      const document = new jsPDF();
      let y = 20;

      document.setFont("helvetica", "bold");
      document.setFontSize(18);
      document.text("Tennis Star", 14, y);
      y += 9;
      document.setFontSize(14);
      document.text("Informe de estadísticas", 14, y);
      y += 8;
      document.setFont("helvetica", "normal");
      document.setFontSize(10);
      document.text(`Período: ${periodLabel}`, 14, y);
      y += 12;

      document.setFont("helvetica", "bold");
      document.setFontSize(12);
      document.text("Resumen", 14, y);
      y += 8;
      document.setFont("helvetica", "normal");
      document.setFontSize(10);
      document.text(`Ingresos netos: ${money.format(Number(data.revenue))}`, 14, y);
      y += 6;
      document.text(`Pedidos completados: ${data.orders}`, 14, y);
      y += 6;
      document.text(`Pedidos completados y pagados: ${data.paidOrders}`, 14, y);
      y += 6;
      document.text(`Ticket promedio cobrado: ${money.format(Number(data.averageTicket))}`, 14, y);
      y += 6;
      document.text(`Reembolsos: ${data.refundedOrders} · ${money.format(Number(data.refundedTotal))}`, 14, y);
      y += 6;
      document.text(`Pedidos cancelados: ${data.cancelledOrders}`, 14, y);
      y += 12;

      const addSectionTitle = (title: string) => {
        if (y > 275) {
          document.addPage();
          y = 20;
        }
        document.setFont("helvetica", "bold");
        document.setFontSize(12);
        document.text(title, 14, y);
        y += 8;
        document.setFont("helvetica", "normal");
        document.setFontSize(9);
      };
      const addLine = (line: string) => {
        if (y > 282) {
          document.addPage();
          y = 20;
        }
        document.text(line, 14, y);
        y += 5.5;
      };

      addSectionTitle("Tendencia de ingresos netos");
      if (data.trend.length === 0) addLine("Sin ventas completadas y pagadas en el período.");
      data.trend.forEach((item) =>
        addLine(`${item.date}  ·  ${money.format(Number(item.revenue))}`),
      );
      y += 6;
      addSectionTitle("Productos vendidos y cobrados");
      if (data.topProducts.length === 0) addLine("Sin productos cobrados en el período.");
      data.topProducts.forEach((product, index) =>
        addLine(`${index + 1}. ${product.name}  ·  ${product.quantity} uds.`),
      );

      document.save(statisticsFilename(periodLabel, "pdf"));
      toast.success("Informe PDF exportado");
    } catch {
      toast.error("No se pudo generar el informe PDF");
    } finally {
      setExportingPdf(false);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:flex" aria-label="Exportar informe">
      <Button type="button" variant="outline" disabled={disabled} onClick={exportCsv}>
        <Download className="size-4" aria-hidden="true" />
        Exportar CSV
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={disabled || exportingPdf}
        onClick={() => void exportPdf()}
      >
        <FileText className="size-4" aria-hidden="true" />
        {exportingPdf ? "Generando…" : "Exportar PDF"}
      </Button>
    </div>
  );
}
