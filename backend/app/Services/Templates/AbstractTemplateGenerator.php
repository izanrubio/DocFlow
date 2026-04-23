<?php

namespace App\Services\Templates;

use DateTimeImmutable;
use TCPDF;

abstract class AbstractTemplateGenerator implements TemplateGeneratorInterface
{
    protected TCPDF $pdf;

    protected function initPdf(string $title): void
    {
        $this->pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
        $this->pdf->SetCreator('DocFlow');
        $this->pdf->SetTitle($title);
        $this->pdf->setPrintHeader(false);
        $this->pdf->setPrintFooter(false);
        $this->pdf->SetMargins(25, 20, 25);
        $this->pdf->SetAutoPageBreak(true, 20);
        $this->pdf->AddPage();
    }

    protected function heading(string $title, ?string $subtitle = null): void
    {
        $this->pdf->SetFont('helvetica', 'B', 16);
        $this->pdf->SetTextColor(15, 23, 42);
        $this->pdf->Cell(0, 12, $title, 0, 1, 'C');

        if ($subtitle) {
            $this->pdf->SetFont('helvetica', 'I', 9);
            $this->pdf->SetTextColor(80, 80, 80);
            $this->pdf->Cell(0, 6, $subtitle, 0, 1, 'C');
        }

        $this->pdf->SetFont('helvetica', '', 8);
        $this->pdf->SetTextColor(100, 100, 100);
        $this->pdf->Cell(0, 6, 'DocFlow — ' . now()->format('Y'), 0, 1, 'C');
        $this->pdf->Ln(4);

        $this->pdf->SetDrawColor(200, 200, 200);
        $this->pdf->Line(25, $this->pdf->GetY(), 185, $this->pdf->GetY());
        $this->pdf->Ln(6);
    }

    protected function body(string $html): void
    {
        $this->pdf->SetFont('helvetica', '', 10);
        $this->pdf->SetTextColor(30, 30, 30);
        $this->pdf->writeHTMLCell(0, 0, '', '', $html, 0, 1);
    }

    protected function disclaimer(): void
    {
        $this->pdf->Ln(6);
        $this->pdf->SetFont('helvetica', 'I', 9);
        $this->pdf->SetTextColor(120, 120, 120);
        $this->pdf->MultiCell(
            0, 5,
            'Documento generado por DocFlow. Consulte con un profesional jurídico antes de utilizarlo en transacciones reales.',
            0, 'C'
        );
    }

    protected function signatures(string $labelA, string $labelB): void
    {
        $this->pdf->Ln(10);
        $y = $this->pdf->GetY() + 15;
        if ($y > 240) {
            $this->pdf->AddPage();
            $y = 30;
        }
        $this->pdf->SetY($y);
        $this->pdf->SetFont('helvetica', '', 10);
        $this->pdf->SetTextColor(30, 30, 30);
        $this->pdf->Cell(75, 6, "Firma de {$labelA}:", 0, 0);
        $this->pdf->Cell(10, 6, '', 0, 0);
        $this->pdf->Cell(75, 6, "Firma de {$labelB}:", 0, 1);
        $this->pdf->Ln(15);
        $this->pdf->Cell(75, 0.5, '', 'T', 0);
        $this->pdf->Cell(10, 0.5, '', 0, 0);
        $this->pdf->Cell(75, 0.5, '', 'T', 1);
        $this->pdf->Ln(3);
        $this->pdf->SetFont('helvetica', '', 9);
        $this->pdf->SetTextColor(100, 100, 100);
        $this->pdf->Cell(75, 5, 'Nombre: _______________________', 0, 0);
        $this->pdf->Cell(10, 5, '', 0, 0);
        $this->pdf->Cell(75, 5, 'Nombre: _______________________', 0, 1);
        $this->pdf->Cell(75, 5, 'Fecha: ________________________', 0, 0);
        $this->pdf->Cell(10, 5, '', 0, 0);
        $this->pdf->Cell(75, 5, 'Fecha: ________________________', 0, 1);
    }

    protected function formatDate(string $value): string
    {
        $months = [
            1 => 'enero', 2 => 'febrero', 3 => 'marzo', 4 => 'abril',
            5 => 'mayo', 6 => 'junio', 7 => 'julio', 8 => 'agosto',
            9 => 'septiembre', 10 => 'octubre', 11 => 'noviembre', 12 => 'diciembre',
        ];
        try {
            $dt = new DateTimeImmutable($value);
            return $dt->format('j') . ' de ' . $months[(int) $dt->format('n')] . ' de ' . $dt->format('Y');
        } catch (\Throwable) {
            return $value;
        }
    }

    protected function formatCurrency(mixed $value): string
    {
        return number_format((float) $value, 2, ',', '.') . ' €';
    }

    protected function v(array $values, string $key, string $fallback = '___'): string
    {
        $raw = $values[$key] ?? $fallback;
        return htmlspecialchars((string) $raw, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    protected function output(): string
    {
        return $this->pdf->Output('doc.pdf', 'S');
    }
}
