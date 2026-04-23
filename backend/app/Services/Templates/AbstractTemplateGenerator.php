<?php

namespace App\Services\Templates;

use DateTimeImmutable;
use TCPDF;

abstract class AbstractTemplateGenerator implements TemplateGeneratorInterface
{
    protected TCPDF $pdf;
    protected int $signaturePage = 1;

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

    // Always creates a new dedicated page for signatures so positions are deterministic.
    // Call after body() + disclaimer(). Records $this->signaturePage for getSignaturePositions().
    protected function signaturesPage(string $labelA, string $labelB): void
    {
        $this->pdf->AddPage('P', [210, 297]);
        $this->signaturePage = $this->pdf->getPage();

        $this->pdf->SetFont('helvetica', 'B', 13);
        $this->pdf->SetTextColor(30, 30, 30);
        $this->pdf->SetXY(0, 15);
        $this->pdf->Cell(210, 8, 'Zona de firmas', 0, 1, 'C');

        $this->pdf->SetFont('helvetica', 'I', 8);
        $this->pdf->SetTextColor(140, 140, 140);
        $this->pdf->SetXY(0, 24);
        $this->pdf->Cell(210, 5, 'Las firmas digitales serán incrustadas en las áreas indicadas', 0, 1, 'C');

        // Labels
        $this->pdf->SetFont('helvetica', 'B', 9);
        $this->pdf->SetTextColor(60, 60, 60);
        $this->pdf->SetXY(25, 34);
        $this->pdf->Cell(75, 5, $labelA, 0, 0, 'L');
        $this->pdf->SetXY(110, 34);
        $this->pdf->Cell(75, 5, $labelB, 0, 1, 'L');

        // Signature placeholder boxes (SealDocumentJob overlays images here)
        $this->pdf->SetDrawColor(180, 180, 180);
        $this->pdf->SetFillColor(248, 249, 250);
        $this->pdf->RoundedRect(25, 40, 75, 30, 2, '1111', 'DF');
        $this->pdf->RoundedRect(110, 40, 75, 30, 2, '1111', 'DF');

        // Hint text inside boxes
        $this->pdf->SetFont('helvetica', 'I', 8);
        $this->pdf->SetTextColor(195, 195, 195);
        $this->pdf->SetXY(25, 53);
        $this->pdf->Cell(75, 5, '[ Firma digital ]', 0, 0, 'C');
        $this->pdf->SetXY(110, 53);
        $this->pdf->Cell(75, 5, '[ Firma digital ]', 0, 1, 'C');
    }

    public function getSignaturePositions(): array
    {
        return [];
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
