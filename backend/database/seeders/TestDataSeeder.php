<?php

namespace Database\Seeders;

use App\Enums\DocumentEventType;
use App\Enums\DocumentStatus;
use App\Enums\SignerStatus;
use App\Enums\TenantPlan;
use App\Models\Document;
use App\Models\DocumentEvent;
use App\Models\Signature;
use App\Models\Signer;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use TCPDF;

class TestDataSeeder extends Seeder
{
    private User $user;
    private int $tenantId;

    // Tiny 1×1 transparent PNG — placeholder signature image
    private const FAKE_SIG = 'iVBORw0KGgoAAAANSUhEUgAAASwAAAAeCAYAAACKSH7RAAAACXBIWXMAAA7EAAAOxAGVKw4b'
        . 'AAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABESURBVHgB7cEBDQAAAMKg909tDjdh'
        . 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
        . 'AAAA4MEAkQABEK0SUQAAAABJRkJggg==';

    public function run(): void
    {
        $this->createUser();
        $this->ensurePlaceholderPdf();

        $this->seedDrafts();
        $this->seedSent();
        $this->seedInProgress();
        $this->seedCompleted();
        $this->seedExpired();
        $this->seedCancelled();

        $total = Document::where('tenant_id', $this->tenantId)->count();
        $this->command->info("Created user test@example.com (password: password) · {$total} documents seeded.");
    }

    // =========================================================================
    // User + Tenant
    // =========================================================================

    private function createUser(): void
    {
        $tenant = Tenant::create([
            'name' => 'Empresa Demo',
            'slug' => 'empresa-demo',
            'plan' => TenantPlan::Pro,
        ]);

        $this->user = User::create([
            'tenant_id'          => $tenant->id,
            'name'               => 'Demo User',
            'email'              => 'test@example.com',
            'password'           => Hash::make('password'),
            'email_verified_at'  => now(),
        ]);

        $this->tenantId = $tenant->id;
    }

    // =========================================================================
    // Drafts — sin firmantes
    // =========================================================================

    private function seedDrafts(): void
    {
        $items = [
            ['title' => 'Contrato de servicios con Acme Corp',                'days' => 0],
            ['title' => 'NDA con inversor seed — Borrador',                   'days' => 1],
            ['title' => 'Propuesta comercial Q2 2026',                        'days' => 2],
            ['title' => 'Acuerdo de colaboración con StartupXYZ',             'days' => 4],
            ['title' => 'Contrato de arrendamiento oficina Madrid',           'days' => 6],
            ['title' => 'Contrato de mantenimiento infraestructura cloud',    'days' => 10],
            ['title' => 'Convenio de prácticas universitarias 2026',          'days' => 14],
        ];

        foreach ($items as $d) {
            $doc = $this->doc($d['title'], DocumentStatus::Draft, $d['days']);
            $this->event($doc, DocumentEventType::Created, $d['days']);
        }
    }

    // =========================================================================
    // Sent — todos pendientes
    // =========================================================================

    private function seedSent(): void
    {
        $items = [
            ['title' => 'Contrato de prestación de servicios — Diseño web',  'days' => 1,  'exp' => 14],
            ['title' => 'Acuerdo marco con Distribuidora Norte',              'days' => 3,  'exp' => 10],
            ['title' => 'NDA con candidato a CTO',                           'days' => 5,  'exp' => 7],
            ['title' => 'Renovación contrato anual — ClienteAlpha',          'days' => 6,  'exp' => 30],
            ['title' => 'Contrato de consultoría estratégica',               'days' => 8,  'exp' => 21],
            ['title' => 'Acuerdo de distribución exclusiva — Región Sur',    'days' => 12, 'exp' => 45],
        ];

        foreach ($items as $d) {
            $doc = $this->doc($d['title'], DocumentStatus::Sent, $d['days'], now()->addDays($d['exp']));
            $this->event($doc, DocumentEventType::Created, $d['days'] + 1);
            $this->event($doc, DocumentEventType::Sent,    $d['days']);
            $this->signer($doc, 'Carlos Martínez', 'carlos.martinez@cliente.com',  1);
            $this->signer($doc, 'Ana Rodríguez',   'ana.rodriguez@cliente.com',    2);
        }
    }

    // =========================================================================
    // In-progress — algunos firmantes han firmado
    // =========================================================================

    private function seedInProgress(): void
    {
        // --- caduca en < 20h (badge rojo "¡Caduca pronto!")
        $doc = $this->doc('Contrato urgente — vence mañana', DocumentStatus::InProgress, 8, now()->addHours(18));
        $this->event($doc, DocumentEventType::Created, 9);
        $this->event($doc, DocumentEventType::Sent, 8);
        $s = $this->signer($doc, 'Roberto Díaz',  'roberto@urgente.com', 1, SignerStatus::Signed, 4);
        $this->sig($s, $doc);
        $this->event($doc, DocumentEventType::Viewed, 5, $s);
        $this->event($doc, DocumentEventType::Signed, 4, $s);
        $this->signer($doc, 'Silvia Moreno', 'silvia@urgente.com', 2);

        // --- caduca en 4 días (badge amarillo)
        $doc = $this->doc('NDA con proveedor cloud — caduca en 4 días', DocumentStatus::InProgress, 6, now()->addDays(4));
        $this->event($doc, DocumentEventType::Created, 7);
        $this->event($doc, DocumentEventType::Sent, 6);
        $s = $this->signer($doc, 'Ignacio Blanco', 'ignacio@cloud.com', 1, SignerStatus::Signed, 3);
        $this->sig($s, $doc);
        $this->event($doc, DocumentEventType::Signed, 3, $s);
        $this->signer($doc, 'Natalia Vega', 'natalia@cloud.com', 2, SignerStatus::Viewed);

        // --- 1/2 firmado
        $doc = $this->doc('Contrato de desarrollo — Proyecto Phoenix', DocumentStatus::InProgress, 4, now()->addDays(12));
        $this->event($doc, DocumentEventType::Created, 5);
        $this->event($doc, DocumentEventType::Sent, 4);
        $s = $this->signer($doc, 'Laura Sánchez', 'laura@phoenix.com', 1, SignerStatus::Signed, 2);
        $this->sig($s, $doc);
        $this->event($doc, DocumentEventType::Viewed, 3, $s);
        $this->event($doc, DocumentEventType::Signed, 2, $s);
        $this->signer($doc, 'Pedro Gómez', 'pedro@phoenix.com', 2);

        // --- 1/3 firmado
        $doc = $this->doc('Acuerdo de confidencialidad — Proyecto Aurora', DocumentStatus::InProgress, 10, now()->addDays(20));
        $this->event($doc, DocumentEventType::Created, 11);
        $this->event($doc, DocumentEventType::Sent, 10);
        $s = $this->signer($doc, 'Marta López',    'marta@aurora.com',  1, SignerStatus::Signed, 7);
        $this->sig($s, $doc);
        $this->event($doc, DocumentEventType::Viewed, 8, $s);
        $this->event($doc, DocumentEventType::Signed, 7, $s);
        $this->signer($doc, 'Javier Torres', 'javier@aurora.com', 2, SignerStatus::Viewed);
        $this->signer($doc, 'Elena Ruiz',    'elena@aurora.com',  3);

        // --- 2/3 firmado
        $doc = $this->doc('Contrato de licencia software — Multi-firma', DocumentStatus::InProgress, 3, now()->addDays(25));
        $this->event($doc, DocumentEventType::Created, 4);
        $this->event($doc, DocumentEventType::Sent, 3);
        $s1 = $this->signer($doc, 'Daniel Castro',  'daniel@licencia.com', 1, SignerStatus::Signed, 2);
        $this->sig($s1, $doc);
        $this->event($doc, DocumentEventType::Signed, 2, $s1);
        $s2 = $this->signer($doc, 'Pilar Méndez',   'pilar@licencia.com',  2, SignerStatus::Signed, 1);
        $this->sig($s2, $doc);
        $this->event($doc, DocumentEventType::Signed, 1, $s2);
        $this->signer($doc, 'Tomás Alonso',  'tomas@licencia.com',  3);
    }

    // =========================================================================
    // Completed
    // =========================================================================

    private function seedCompleted(): void
    {
        $items = [
            [
                'title'   => 'Contrato servicios web — Completado',
                'days'    => 30,
                'signers' => [['Antonio Fernández', 'antonio@web.com'], ['Beatriz Castro', 'beatriz@web.com']],
            ],
            [
                'title'   => 'NDA con socio tecnológico',
                'days'    => 20,
                'signers' => [['Diego Morales', 'diego@socio.com'], ['Cristina Rubio', 'cristina@socio.com']],
            ],
            [
                'title'   => 'Acuerdo de distribución internacional',
                'days'    => 45,
                'signers' => [
                    ['Francisco León',  'francisco@dist.com'],
                    ['Isabel Ortega',   'isabel@dist.com'],
                    ['Manuel Serrano',  'manuel@dist.com'],
                ],
            ],
            [
                'title'   => 'Contrato de arrendamiento — Local comercial Málaga',
                'days'    => 60,
                'signers' => [['Rosa Peña', 'rosa@local.com'], ['Jorge Herrero', 'jorge@local.com']],
            ],
            [
                'title'   => 'Acuerdo de inversión — Ronda seed',
                'days'    => 15,
                'signers' => [['Álvaro Delgado', 'alvaro@invest.com'], ['Patricia Lozano', 'patricia@invest.com']],
            ],
            [
                'title'   => 'Contrato de agencia exclusiva — Zona Norte',
                'days'    => 90,
                'signers' => [['Víctor Heredia', 'victor@agencia.com'], ['Carmen Fuentes', 'carmen@agencia.com']],
            ],
            [
                'title'   => 'Convenio de colaboración con universidad',
                'days'    => 120,
                'signers' => [
                    ['Prof. Ramírez',  'ramirez@uni.es'],
                    ['Decana García',  'garcia@uni.es'],
                ],
            ],
        ];

        foreach ($items as $d) {
            $doc = $this->doc($d['title'], DocumentStatus::Completed, $d['days']);
            $this->event($doc, DocumentEventType::Created, $d['days'] + 2);
            $this->event($doc, DocumentEventType::Sent,    $d['days'] + 1);

            foreach ($d['signers'] as $i => [$name, $email]) {
                $offset = $d['days'] - $i;
                $s = $this->signer($doc, $name, $email, $i + 1, SignerStatus::Signed, $offset);
                $this->sig($s, $doc);
                $this->event($doc, DocumentEventType::Viewed,  $offset + 1, $s);
                $this->event($doc, DocumentEventType::Signed,  $offset, $s);
            }

            $this->event($doc, DocumentEventType::Completed, $d['days']);
        }
    }

    // =========================================================================
    // Expired
    // =========================================================================

    private function seedExpired(): void
    {
        $items = [
            ['title' => 'Propuesta de consultoría — Caducado',      'sent' => 25, 'exp_ago' => 5],
            ['title' => 'Contrato de mantenimiento — Expirado',     'sent' => 40, 'exp_ago' => 10],
            ['title' => 'NDA con candidato — No firmado a tiempo',  'sent' => 18, 'exp_ago' => 2],
            ['title' => 'Contrato SaaS — Plazo superado',           'sent' => 50, 'exp_ago' => 15],
        ];

        foreach ($items as $d) {
            $expiresAt = now()->subDays($d['exp_ago']);
            $doc = $this->doc($d['title'], DocumentStatus::Expired, $d['sent'], $expiresAt);
            $this->event($doc, DocumentEventType::Created,      $d['sent'] + 1);
            $this->event($doc, DocumentEventType::Sent,         $d['sent']);
            $this->signer($doc, 'Firmante Pendiente', 'pendiente@test.com', 1);
            $this->event($doc, DocumentEventType::ReminderSent, $d['sent'] - 5);
            $this->event($doc, DocumentEventType::Expired,      $d['exp_ago']);
        }
    }

    // =========================================================================
    // Cancelled
    // =========================================================================

    private function seedCancelled(): void
    {
        $items = [
            ['title' => 'Contrato cancelado a petición del cliente', 'days' => 15],
            ['title' => 'Acuerdo retirado — Condiciones no aceptadas', 'days' => 30],
        ];

        foreach ($items as $d) {
            $doc = $this->doc($d['title'], DocumentStatus::Cancelled, $d['days']);
            $this->event($doc, DocumentEventType::Created, $d['days'] + 1);
            $this->event($doc, DocumentEventType::Sent,    $d['days']);
            $this->signer($doc, 'Cliente', 'cliente@test.com', 1);
        }
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private function doc(
        string $title,
        DocumentStatus $status,
        int $daysAgo,
        ?Carbon $expiresAt = null
    ): Document {
        $at = now()->subDays($daysAgo)->subHours(rand(0, 8));

        return Document::create([
            'tenant_id'         => $this->tenantId,
            'user_id'           => $this->user->id,
            'title'             => $title,
            'file_path'         => 'seeds/placeholder.pdf',
            'original_filename' => Str::slug($title) . '.pdf',
            'status'            => $status,
            'expires_at'        => $expiresAt,
            'created_at'        => $at,
            'updated_at'        => $at,
        ]);
    }

    private function signer(
        Document $doc,
        string $name,
        string $email,
        int $order,
        SignerStatus $status = SignerStatus::Pending,
        ?int $signedDaysAgo = null
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

    private function sig(Signer $signer, Document $doc): void
    {
        Signature::create([
            'signer_id'      => $signer->id,
            'document_id'    => $doc->id,
            'signature_data' => 'data:image/png;base64,' . self::FAKE_SIG,
            'ip_address'     => '192.168.' . rand(1, 254) . '.' . rand(1, 254),
            'user_agent'     => 'Mozilla/5.0 (compatible; DocFlow/test)',
        ]);
    }

    private function event(Document $doc, DocumentEventType $type, int $daysAgo, ?Signer $signer = null): void
    {
        $at = now()->subDays($daysAgo)->subMinutes(rand(0, 59));
        DocumentEvent::create([
            'document_id' => $doc->id,
            'tenant_id'   => $this->tenantId,
            'signer_id'   => $signer?->id,
            'type'        => $type,
            'created_at'  => $at,
            'updated_at'  => $at,
        ]);
    }

    private function ensurePlaceholderPdf(): void
    {
        if (Storage::disk('documents')->exists('seeds/placeholder.pdf')) {
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
        $pdf->Cell(0, 8, 'Este documento es un placeholder generado para pruebas.', 0, 1, 'C');

        Storage::disk('documents')->put('seeds/placeholder.pdf', $pdf->Output('placeholder.pdf', 'S'));
    }
}
