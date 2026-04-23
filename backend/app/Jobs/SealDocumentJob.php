<?php

namespace App\Jobs;

use App\Models\Document;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use setasign\Fpdi\Tcpdf\Fpdi;
use Spatie\Multitenancy\Jobs\NotTenantAware;
use Throwable;

class SealDocumentJob implements ShouldQueue, NotTenantAware
{
    use Queueable;

    public int $tries = 2;

    public function __construct(public Document $document) {}

    public function handle(): void
    {
        $document = $this->document->load(['signers.signature']);

        $tmpOriginal = tempnam(sys_get_temp_dir(), 'docflow_orig_') . '.pdf';
        $tmpSigned   = tempnam(sys_get_temp_dir(), 'docflow_signed_') . '.pdf';

        try {
            $contents = Storage::disk('documents')->get($document->file_path);
            file_put_contents($tmpOriginal, $contents);

            $pdf = new Fpdi();
            $pdf->SetAutoPageBreak(false);
            $pdf->setPrintHeader(false);
            $pdf->setPrintFooter(false);

            $pageCount = $pdf->setSourceFile($tmpOriginal);

            // Index signature positions by page number for O(1) lookup
            $positionsByPage = [];
            foreach ($document->signature_positions ?? [] as $pos) {
                $positionsByPage[(int) $pos['page']][] = $pos;
            }

            for ($i = 1; $i <= $pageCount; $i++) {
                $tpl  = $pdf->importPage($i);
                $size = $pdf->getTemplateSize($tpl);
                $orientation = $size['width'] > $size['height'] ? 'L' : 'P';
                $pdf->AddPage($orientation, [$size['width'], $size['height']]);
                $pdf->useTemplate($tpl, 0, 0, $size['width'], $size['height']);

                // Embed signatures on top of this page if positions are defined for it
                if (isset($positionsByPage[$i])) {
                    foreach ($positionsByPage[$i] as $pos) {
                        $signer = $document->signers->firstWhere('order', $pos['signer_order']);
                        if ($signer && $signer->signature) {
                            $this->embedSignatureAtPosition($pdf, $signer, $pos);
                        }
                    }
                }
            }

            // Legacy behavior: add a separate signatures page when no positions defined
            if (empty($document->signature_positions)) {
                $this->addSignaturesPage($pdf, $document);
            }

            $this->addAuditPage($pdf, $document);

            $pdf->Output($tmpSigned, 'F');

            $signedPath = "{$document->tenant_id}/signed/{$document->id}/signed_" . now()->timestamp . '.pdf';
            Storage::disk('documents')->put($signedPath, file_get_contents($tmpSigned), 'private');

            $document->update(['signed_file_path' => $signedPath]);

            SendCompletionNotificationJob::dispatch($document->fresh());
        } finally {
            @unlink($tmpOriginal);
            @unlink($tmpSigned);
        }
    }

    private function embedSignatureAtPosition(Fpdi $pdf, $signer, array $pos): void
    {
        $sigData = $signer->signature->signature_data;
        if (str_starts_with($sigData, 'data:image/png;base64,')) {
            $sigData = substr($sigData, strlen('data:image/png;base64,'));
        }

        $tmpSig = tempnam(sys_get_temp_dir(), 'docflow_sig_') . '.png';
        file_put_contents($tmpSig, base64_decode($sigData));

        try {
            // White background to cleanly overwrite the placeholder box
            $pdf->SetFillColor(255, 255, 255);
            $pdf->Rect($pos['x'], $pos['y'], $pos['width'], $pos['height'], 'F');

            $pdf->Image($tmpSig, $pos['x'], $pos['y'], $pos['width'], $pos['height'], 'PNG');
        } catch (Throwable) {
            // skip corrupt image
        } finally {
            @unlink($tmpSig);
        }

        // Name, email and date immediately below the image box
        $textY = $pos['y'] + $pos['height'] + 2;

        $pdf->SetFont('helvetica', 'B', 7);
        $pdf->SetTextColor(30, 30, 30);
        $pdf->SetXY($pos['x'], $textY);
        $pdf->Cell($pos['width'], 4, $signer->name, 0, 1, 'L');

        $pdf->SetFont('helvetica', '', 6);
        $pdf->SetTextColor(80, 80, 80);
        $pdf->SetXY($pos['x'], $textY + 4);
        $pdf->Cell($pos['width'], 3.5, $signer->email, 0, 1, 'L');

        if ($signer->signed_at) {
            $pdf->SetXY($pos['x'], $textY + 7.5);
            $pdf->Cell($pos['width'], 3.5, 'Firmado: ' . $signer->signed_at->format('d/m/Y H:i:s') . ' UTC', 0, 1, 'L');
        }
    }

    private function addSignaturesPage(Fpdi $pdf, Document $document): void
    {
        $signedSigners = $document->signers
            ->filter(fn ($s) => $s->signature !== null)
            ->sortBy('order');

        if ($signedSigners->isEmpty()) {
            return;
        }

        $pdf->AddPage('P', [210, 297]);
        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->SetTextColor(30, 30, 30);
        $pdf->SetXY(15, 15);
        $pdf->Cell(0, 10, 'Firmas del documento', 0, 1, 'C');

        $pdf->SetFont('helvetica', '', 9);
        $pdf->SetTextColor(100, 100, 100);
        $pdf->SetXY(15, 28);
        $pdf->Cell(0, 6, $document->title, 0, 1, 'C');

        $y = 42;

        foreach ($signedSigners as $signer) {
            if ($y > 230) {
                $pdf->AddPage('P', [210, 297]);
                $y = 20;
            }

            $pdf->SetDrawColor(220, 220, 220);
            $pdf->SetFillColor(250, 250, 250);
            $pdf->RoundedRect(12, $y, 186, 50, 3, '1111', 'DF');

            $sigData = $signer->signature->signature_data;
            if (str_starts_with($sigData, 'data:image/png;base64,')) {
                $sigData = substr($sigData, strlen('data:image/png;base64,'));
            }

            $tmpSig = tempnam(sys_get_temp_dir(), 'docflow_sig_') . '.png';
            file_put_contents($tmpSig, base64_decode($sigData));

            try {
                $pdf->Image($tmpSig, 15, $y + 5, 70, 30, 'PNG');
            } catch (Throwable) {
                // skip corrupt image
            } finally {
                @unlink($tmpSig);
            }

            $pdf->SetFont('helvetica', 'B', 10);
            $pdf->SetTextColor(30, 30, 30);
            $pdf->SetXY(90, $y + 8);
            $pdf->Cell(100, 6, $signer->name, 0, 1);

            $pdf->SetFont('helvetica', '', 9);
            $pdf->SetTextColor(80, 80, 80);
            $pdf->SetXY(90, $y + 16);
            $pdf->Cell(100, 5, $signer->email, 0, 1);

            if ($signer->signed_at) {
                $pdf->SetXY(90, $y + 23);
                $pdf->Cell(100, 5, 'Firmado: ' . $signer->signed_at->format('d/m/Y H:i:s') . ' UTC', 0, 1);
            }

            if ($signer->signature->ip_address) {
                $pdf->SetXY(90, $y + 30);
                $pdf->Cell(100, 5, 'IP: ' . $signer->signature->ip_address, 0, 1);
            }

            $y += 58;
        }
    }

    private function addAuditPage(Fpdi $pdf, Document $document): void
    {
        $pdf->AddPage('P', [210, 297]);

        $pdf->SetFillColor(15, 23, 42);
        $pdf->Rect(0, 0, 210, 30, 'F');

        $pdf->SetFont('helvetica', 'B', 18);
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetXY(0, 8);
        $pdf->Cell(210, 12, 'Certificado de firma', 0, 1, 'C');

        $pdf->SetFont('helvetica', '', 9);
        $pdf->SetTextColor(150, 150, 150);
        $pdf->SetXY(0, 21);
        $pdf->Cell(210, 6, 'DocFlow — Sistema de firma electrónica', 0, 1, 'C');

        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->SetTextColor(30, 30, 30);
        $pdf->SetXY(15, 40);
        $pdf->Cell(0, 7, 'Información del documento', 0, 1);

        $pdf->SetFont('helvetica', '', 9);
        $pdf->SetTextColor(60, 60, 60);

        $rows = [
            ['Título', $document->title],
            ['ID', (string) $document->id],
            ['Estado', $document->status->value],
            ['Creado', $document->created_at->format('d/m/Y H:i:s') . ' UTC'],
        ];

        $y = 50;
        foreach ($rows as [$label, $value]) {
            $pdf->SetFont('helvetica', 'B', 9);
            $pdf->SetXY(15, $y);
            $pdf->Cell(40, 6, $label . ':', 0, 0);
            $pdf->SetFont('helvetica', '', 9);
            $pdf->Cell(140, 6, $value, 0, 1);
            $y += 6;
        }

        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->SetTextColor(30, 30, 30);
        $pdf->SetXY(15, $y + 6);
        $pdf->Cell(0, 7, 'Firmantes', 0, 1);
        $y += 16;

        $pdf->SetFillColor(15, 23, 42);
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetFont('helvetica', 'B', 8);
        $pdf->SetXY(15, $y);
        $pdf->Cell(6, 7, '#', 1, 0, 'C', true);
        $pdf->Cell(50, 7, 'Nombre', 1, 0, 'C', true);
        $pdf->Cell(55, 7, 'Email', 1, 0, 'C', true);
        $pdf->Cell(40, 7, 'Fecha de firma', 1, 0, 'C', true);
        $pdf->Cell(25, 7, 'IP', 1, 1, 'C', true);
        $y += 7;

        $pdf->SetTextColor(30, 30, 30);
        $pdf->SetFont('helvetica', '', 8);

        foreach ($document->signers->sortBy('order') as $i => $signer) {
            $pdf->SetFillColor($i % 2 === 0 ? 250 : 240, $i % 2 === 0 ? 250 : 240, $i % 2 === 0 ? 250 : 240);
            $pdf->SetXY(15, $y);
            $pdf->Cell(6, 6, (string) ($i + 1), 1, 0, 'C', true);
            $pdf->Cell(50, 6, $signer->name, 1, 0, 'L', true);
            $pdf->Cell(55, 6, $signer->email, 1, 0, 'L', true);
            $signedAt = $signer->signed_at ? $signer->signed_at->format('d/m/Y H:i') : '—';
            $pdf->Cell(40, 6, $signedAt, 1, 0, 'C', true);
            $ip = $signer->signature?->ip_address ?? '—';
            $pdf->Cell(25, 6, $ip, 1, 1, 'C', true);
            $y += 6;
        }

        $originalContents = Storage::disk('documents')->get($document->file_path);
        $hash = hash('sha256', $originalContents ?: '');

        $pdf->SetFont('helvetica', 'B', 9);
        $pdf->SetTextColor(60, 60, 60);
        $pdf->SetXY(15, $y + 10);
        $pdf->Cell(0, 6, 'SHA-256 documento original:', 0, 1);
        $pdf->SetFont('courier', '', 7);
        $pdf->SetXY(15, $y + 16);
        $pdf->Cell(0, 5, $hash, 0, 1);

        $pdf->SetFont('helvetica', '', 8);
        $pdf->SetTextColor(120, 120, 120);
        $pdf->SetXY(15, 270);
        $pdf->Cell(0, 5, 'Documento generado por DocFlow — ' . now()->format('d/m/Y H:i:s') . ' UTC', 0, 1, 'C');
    }
}
