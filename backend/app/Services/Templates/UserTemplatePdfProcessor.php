<?php

namespace App\Services\Templates;

use Illuminate\Support\Facades\Storage;
use setasign\Fpdi\Tcpdf\Fpdi;

class UserTemplatePdfProcessor
{
    public function process(string $sourcePath, array $variables, array $values): string
    {
        $tmpIn  = sys_get_temp_dir() . '/' . uniqid('tpl_in_')  . '.pdf';
        $tmpOut = sys_get_temp_dir() . '/' . uniqid('tpl_out_') . '.pdf';

        try {
            file_put_contents($tmpIn, Storage::disk('documents')->get($sourcePath));

            $pdf = new Fpdi();
            $pdf->SetCreator('DocFlow');
            $pdf->setPrintHeader(false);
            $pdf->setPrintFooter(false);
            $pdf->SetMargins(20, 20, 20);
            $pdf->SetAutoPageBreak(true, 20);

            // ── Página de resumen de variables ────────────────────────
            $pdf->AddPage('P', 'A4');

            $pdf->SetFont('helvetica', 'B', 15);
            $pdf->SetTextColor(40, 40, 40);
            $pdf->Cell(0, 12, 'Datos del documento', 0, 1, 'C');

            $pdf->SetFont('helvetica', '', 9);
            $pdf->SetTextColor(120);
            $pdf->Cell(0, 6, 'Valores registrados al generar este documento', 0, 1, 'C');
            $pdf->Ln(6);

            $labelMap = collect($variables)->keyBy('key');

            $hasValues = false;
            foreach ($values as $key => $value) {
                if ($value === null || $value === '') continue;
                $hasValues = true;

                $label = $labelMap->get($key)['label'] ?? ucfirst(str_replace('_', ' ', $key));

                $pdf->SetFont('helvetica', 'B', 9);
                $pdf->SetTextColor(60);
                $pdf->Cell(65, 8, $label . ':', 0, 0);

                $pdf->SetFont('helvetica', '', 9);
                $pdf->SetTextColor(30);
                $pdf->MultiCell(0, 8, (string) $value, 0, 'L', false, 1);
            }

            if (!$hasValues) {
                $pdf->SetFont('helvetica', 'I', 9);
                $pdf->SetTextColor(150);
                $pdf->Cell(0, 8, 'Sin valores registrados.', 0, 1, 'C');
            }

            $pdf->Ln(6);
            $pdf->SetFont('helvetica', 'I', 8);
            $pdf->SetTextColor(160);
            $pdf->Cell(0, 5, 'Generado por DocFlow el ' . now()->format('d/m/Y \a \l\a\s H:i'), 0, 1, 'C');

            // ── Páginas originales ────────────────────────────────────
            $pageCount = $pdf->setSourceFile($tmpIn);
            for ($i = 1; $i <= $pageCount; $i++) {
                $tplId = $pdf->importPage($i);
                $size  = $pdf->getTemplateSize($tplId);
                $w     = (float) $size['width'];
                $h     = (float) $size['height'];
                $pdf->AddPage($w > $h ? 'L' : 'P', [$w, $h]);
                $pdf->useTemplate($tplId, 0, 0, $w, $h, true);
            }

            $pdf->Output($tmpOut, 'F');

            return (string) file_get_contents($tmpOut);
        } finally {
            @unlink($tmpIn);
            @unlink($tmpOut);
        }
    }
}
