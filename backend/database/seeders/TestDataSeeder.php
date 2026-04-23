<?php

namespace Database\Seeders;

use App\Enums\DocumentEventType;
use App\Enums\DocumentStatus;
use App\Enums\SignerStatus;
use App\Models\Document;
use App\Models\DocumentEvent;
use App\Models\Signature;
use App\Models\Signer;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use TCPDF;

class TestDataSeeder extends Seeder
{
    private int $tenantId;
    private int $userId;
    private string $placeholderPath = 'seeds/placeholder.pdf';

    // Minimal 1x1 transparent PNG as base64 — used for fake signatures
    private const FAKE_SIG = 'iVBORw0KGgoAAAANSUhEUgAAASwAAAAeCAYAAACKSH7RAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAA'
        . 'AXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABESURBVHgB7cEBDQAAAMKg909tDjdhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgwQCRAAEQrRJRAAAAABJRU5ErkJggg==';

    public function run(): void
    {
        $user = User::first();
        if (!$user) {
            $this->command->error('No user found. Run DatabaseSeeder first.');
            return;
        }

        $this->tenantId = $user->tenant_id;
        $this->userId   = $user->id;

        $this->ensurePlaceholderPdf();

        $this->createDraftDocuments();
        $this->createSentDocuments();
        $this->createInProgressDocuments();
        $this->createCompletedDocuments();
        $this->createExpiredDocuments();
        $this->createCancelledDocuments();

        $this->command->info('Test documents seeded successfully.');
    }

    // -------------------------------------------------------------------------
    // Draft documents — no signers added yet
    // -------------------------------------------------------------------------
    private function createDraftDocuments(): void
    {
        $drafts = [
            ['title' => 'Contrato de servicios con Acme Corp',       'days_ago' => 1],
            ['title' => 'NDA con inversor seed',                     'days_ago' => 2],
            ['title' => 'Propuesta comercial Q2 2026',               'days_ago' => 3],
            ['title' => 'Acuerdo de colaboración con StartupXYZ',    'days_ago' => 5],
            ['title' => 'Contrato de arrendamiento oficina Madrid',  'days_ago' => 7],
        ];

        foreach ($drafts as $d) {
            $doc = $this->makeDocument($d['title'], DocumentStatus::Draft, $d['days_ago']);
            $this->addEvent($doc, DocumentEventType::Created, $d['days_ago']);
        }
    }

    // -------------------------------------------------------------------------
    // Sent documents — all signers pending, no one has opened yet
    // -------------------------------------------------------------------------
    private function createSentDocuments(): void
    {
        $sent = [
            ['title' => 'Contrato de prestación de servicios — Diseño web',  'days_ago' => 1,  'expires_in' => 14],
            ['title' => 'Acuerdo marco con Distribuidora Norte',              'days_ago' => 3,  'expires_in' => 10],
            ['title' => 'NDA con candidato a CTO',                           'days_ago' => 5,  'expires_in' => 7],
            ['title' => 'Renovación contrato anual — ClienteAlpha',          'days_ago' => 6,  'expires_in' => 30],
        ];

        foreach ($sent as $d) {
            $expiresAt = now()->addDays($d['expires_in']);
            $doc = $this->makeDocument($d['title'], DocumentStatus::Sent, $d['days_ago'], $expiresAt);
            $this->addEvent($doc, DocumentEventType::Created, $d['days_ago'] + 1);
            $this->addEvent($doc, DocumentEventType::Sent,    $d['days_ago']);
            $this->addSigner($doc, 'Carlos Martínez',  'carlos@cliente.com',  1, SignerStatus::Pending, null);
            $this->addSigner($doc, 'Ana Rodríguez',    'ana@cliente.com',     2, SignerStatus::Pending, null);
        }
    }

    // -------------------------------------------------------------------------
    // In-progress — some signers have signed, others pending
    // -------------------------------------------------------------------------
    private function createInProgressDocuments(): void
    {
        // 1 of 2 signed
        $doc = $this->makeDocument(
            'Contrato de desarrollo — Proyecto Phoenix',
            DocumentStatus::InProgress, 4, now()->addDays(5)
        );
        $this->addEvent($doc, DocumentEventType::Created, 5);
        $this->addEvent($doc, DocumentEventType::Sent,    4);
        $s1 = $this->addSigner($doc, 'Laura Sánchez', 'laura@phoenix.com', 1, SignerStatus::Signed, 3);
        $this->addSignature($s1, $doc, 3);
        $this->addEvent($doc, DocumentEventType::Viewed,  3, $s1);
        $this->addEvent($doc, DocumentEventType::Signed,  3, $s1);
        $this->addSigner($doc, 'Pedro Gómez', 'pedro@phoenix.com', 2, SignerStatus::Pending, null);

        // 1 of 3 signed
        $doc2 = $this->makeDocument(
            'Acuerdo de confidencialidad — Proyecto Aurora',
            DocumentStatus::InProgress, 8, now()->addDays(20)
        );
        $this->addEvent($doc2, DocumentEventType::Created, 9);
        $this->addEvent($doc2, DocumentEventType::Sent,    8);
        $s2a = $this->addSigner($doc2, 'Marta López',    'marta@aurora.com',  1, SignerStatus::Signed, 6);
        $this->addSignature($s2a, $doc2, 6);
        $this->addEvent($doc2, DocumentEventType::Viewed,  7, $s2a);
        $this->addEvent($doc2, DocumentEventType::Signed,  6, $s2a);
        $this->addSigner($doc2, 'Javier Torres', 'javier@aurora.com', 2, SignerStatus::Viewed, null);
        $this->addSigner($doc2, 'Elena Ruiz',    'elena@aurora.com',  3, SignerStatus::Pending, null);

        // Caduca pronto (< 48h)
        $doc3 = $this->makeDocument(
            'Contrato urgente — vence mañana',
            DocumentStatus::InProgress, 10, now()->addHours(20)
        );
        $this->addEvent($doc3, DocumentEventType::Created, 11);
        $this->addEvent($doc3, DocumentEventType::Sent,    10);
        $s3 = $this->addSigner($doc3, 'Roberto Díaz', 'roberto@urgente.com', 1, SignerStatus::Signed, 5);
        $this->addSignature($s3, $doc3, 5);
        $this->addEvent($doc3, DocumentEventType::Signed, 5, $s3);
        $this->addSigner($doc3, 'Silvia Moreno', 'silvia@urgente.com', 2, SignerStatus::Pending, null);

        // Caduca en menos de 7 días (< 7d but > 2d)
        $doc4 = $this->makeDocument(
            'NDA con proveedor cloud — caduca en 4 días',
            DocumentStatus::InProgress, 3, now()->addDays(4)
        );
        $this->addEvent($doc4, DocumentEventType::Created, 4);
        $this->addEvent($doc4, DocumentEventType::Sent,    3);
        $s4 = $this->addSigner($doc4, 'Ignacio Blanco', 'ignacio@cloud.com', 1, SignerStatus::Signed, 2);
        $this->addSignature($s4, $doc4, 2);
        $this->addEvent($doc4, DocumentEventType::Signed, 2, $s4);
        $this->addSigner($doc4, 'Natalia Vega', 'natalia@cloud.com', 2, SignerStatus::Pending, null);
    }

    // -------------------------------------------------------------------------
    // Completed — all signed, with reminder events mixed in
    // -------------------------------------------------------------------------
    private function createCompletedDocuments(): void
    {
        $completed = [
            [
                'title'    => 'Contrato servicios web — Firmado',
                'days_ago' => 30,
                'signers'  => [
                    ['name' => 'Antonio Fernández', 'email' => 'antonio@web.com'],
                    ['name' => 'Beatriz Castro',    'email' => 'beatriz@web.com'],
                ],
            ],
            [
                'title'    => 'NDA con socio tecnológico — Completado',
                'days_ago' => 20,
                'signers'  => [
                    ['name' => 'Diego Morales',  'email' => 'diego@socio.com'],
                    ['name' => 'Cristina Rubio', 'email' => 'cristina@socio.com'],
                ],
            ],
            [
                'title'    => 'Acuerdo de distribución internacional',
                'days_ago' => 45,
                'signers'  => [
                    ['name' => 'Francisco León',  'email' => 'francisco@dist.com'],
                    ['name' => 'Isabel Ortega',   'email' => 'isabel@dist.com'],
                    ['name' => 'Manuel Serrano',  'email' => 'manuel@dist.com'],
                ],
            ],
            [
                'title'    => 'Contrato de arrendamiento — Local comercial',
                'days_ago' => 60,
                'signers'  => [
                    ['name' => 'Rosa Peña',      'email' => 'rosa@local.com'],
                    ['name' => 'Jorge Herrero',  'email' => 'jorge@local.com'],
                ],
            ],
            [
                'title'    => 'Acuerdo de inversión ronda seed',
                'days_ago' => 15,
                'signers'  => [
                    ['name' => 'Álvaro Delgado', 'email' => 'alvaro@invest.com'],
                    ['name' => 'Patricia Lozano','email' => 'patricia@invest.com'],
                ],
            ],
        ];

        foreach ($completed as $d) {
            $doc = $this->makeDocument($d['title'], DocumentStatus::Completed, $d['days_ago']);
            $this->addEvent($doc, DocumentEventType::Created, $d['days_ago'] + 2);
            $this->addEvent($doc, DocumentEventType::Sent,    $d['days_ago'] + 1);

            $signedAt = $d['days_ago'];
            foreach ($d['signers'] as $i => $s) {
                $signer = $this->addSigner($doc, $s['name'], $s['email'], $i + 1, SignerStatus::Signed, $signedAt - $i);
                $this->addSignature($signer, $doc, $signedAt - $i);
                $this->addEvent($doc, DocumentEventType::Viewed,  $signedAt - $i + 1, $signer);
                $this->addEvent($doc, DocumentEventType::Signed,  $signedAt - $i, $signer);
            }

            $this->addEvent($doc, DocumentEventType::Completed, $signedAt);
        }
    }

    // -------------------------------------------------------------------------
    // Expired
    // -------------------------------------------------------------------------
    private function createExpiredDocuments(): void
    {
        $expired = [
            ['title' => 'Propuesta de consultoría — Caducado',       'days_ago' => 20, 'expired_days_ago' => 5],
            ['title' => 'Contrato de mantenimiento — Expirado',      'days_ago' => 35, 'expired_days_ago' => 10],
            ['title' => 'NDA con candidato — No firmado a tiempo',   'days_ago' => 15, 'expired_days_ago' => 2],
        ];

        foreach ($expired as $d) {
            $expiresAt = now()->subDays($d['expired_days_ago']);
            $doc = $this->makeDocument($d['title'], DocumentStatus::Expired, $d['days_ago'], $expiresAt);
            $this->addEvent($doc, DocumentEventType::Created, $d['days_ago'] + 1);
            $this->addEvent($doc, DocumentEventType::Sent,    $d['days_ago']);
            $this->addSigner($doc, 'Firmante Pendiente', 'pendiente@test.com', 1, SignerStatus::Pending, null);
            $this->addEvent($doc, DocumentEventType::ReminderSent, $d['days_ago'] - 3);
            $this->addEvent($doc, DocumentEventType::Expired, $d['expired_days_ago']);
        }
    }

    // -------------------------------------------------------------------------
    // Cancelled
    // -------------------------------------------------------------------------
    private function createCancelledDocuments(): void
    {
        $doc = $this->makeDocument('Contrato cancelado por el cliente', DocumentStatus::Cancelled, 12);
        $this->addEvent($doc, DocumentEventType::Created, 13);
        $this->addEvent($doc, DocumentEventType::Sent,    12);
        $this->addSigner($doc, 'Cliente Cancelado', 'cancel@test.com', 1, SignerStatus::Pending, null);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------
    private function makeDocument(
        string $title,
        DocumentStatus $status,
        int $daysAgo,
        ?Carbon $expiresAt = null
    ): Document {
        $createdAt = now()->subDays($daysAgo)->subHours(rand(0, 8));

        return Document::create([
            'tenant_id'         => $this->tenantId,
            'user_id'           => $this->userId,
            'title'             => $title,
            'file_path'         => $this->placeholderPath,
            'original_filename' => \Str::slug($title) . '.pdf',
            'status'            => $status,
            'expires_at'        => $expiresAt,
            'created_at'        => $createdAt,
            'updated_at'        => $createdAt,
        ]);
    }

    private function addSigner(
        Document $doc,
        string $name,
        string $email,
        int $order,
        SignerStatus $status,
        ?int $signedDaysAgo
    ): Signer {
        return Signer::create([
            'document_id' => $doc->id,
            'tenant_id'   => $this->tenantId,
            'name'        => $name,
            'email'       => $email,
            'order'       => $order,
            'status'      => $status,
            'signed_at'   => $signedDaysAgo !== null ? now()->subDays($signedDaysAgo) : null,
        ]);
    }

    private function addSignature(Signer $signer, Document $doc, int $daysAgo): void
    {
        Signature::create([
            'signer_id'      => $signer->id,
            'document_id'    => $doc->id,
            'signature_data' => 'data:image/png;base64,' . self::FAKE_SIG,
            'ip_address'     => '192.168.' . rand(1, 254) . '.' . rand(1, 254),
            'user_agent'     => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0',
        ]);
    }

    private function addEvent(Document $doc, DocumentEventType $type, int $daysAgo, ?Signer $signer = null): void
    {
        DocumentEvent::create([
            'document_id' => $doc->id,
            'tenant_id'   => $this->tenantId,
            'signer_id'   => $signer?->id,
            'type'        => $type,
            'created_at'  => now()->subDays($daysAgo)->subMinutes(rand(0, 60)),
            'updated_at'  => now()->subDays($daysAgo),
        ]);
    }

    private function ensurePlaceholderPdf(): void
    {
        if (Storage::disk('documents')->exists($this->placeholderPath)) {
            return;
        }

        $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
        $pdf->SetCreator('DocFlow');
        $pdf->SetTitle('Documento de prueba');
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->SetMargins(25, 20, 25);
        $pdf->SetAutoPageBreak(true, 20);
        $pdf->AddPage();
        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->SetTextColor(15, 23, 42);
        $pdf->Cell(0, 12, 'Documento de prueba — DocFlow', 0, 1, 'C');
        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetTextColor(100, 100, 100);
        $pdf->Cell(0, 8, 'Este es un documento generado para pruebas del sistema.', 0, 1, 'C');

        Storage::disk('documents')->put($this->placeholderPath, $pdf->Output('placeholder.pdf', 'S'));
    }
}
