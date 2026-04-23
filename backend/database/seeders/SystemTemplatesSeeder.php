<?php

namespace Database\Seeders;

use App\Models\Template;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use TCPDF;

class SystemTemplatesSeeder extends Seeder
{
    private array $templates = [
        [
            'slug'        => 'nda',
            'name'        => 'Acuerdo de Confidencialidad (NDA)',
            'description' => 'Acuerdo de no divulgación estándar entre dos partes. Incluye cláusulas sobre información confidencial, obligaciones de las partes y vigencia.',
            'content'     => self::NDA_CONTENT,
        ],
        [
            'slug'        => 'servicios',
            'name'        => 'Contrato de Prestación de Servicios',
            'description' => 'Contrato para autónomos y freelance. Incluye descripción de servicios, honorarios, plazos y condiciones de pago.',
            'content'     => self::SERVICIOS_CONTENT,
        ],
        [
            'slug'        => 'arrendamiento',
            'name'        => 'Contrato de Arrendamiento',
            'description' => 'Contrato de alquiler de inmueble conforme a la LAU. Incluye descripción del inmueble, renta, fianza y condiciones generales.',
            'content'     => self::ARRENDAMIENTO_CONTENT,
        ],
    ];

    public function run(): void
    {
        foreach ($this->templates as $tpl) {
            if (Template::where('file_path', "system/templates/{$tpl['slug']}.pdf")->exists()) {
                continue;
            }

            $pdf = $this->buildPdf($tpl['name'], $tpl['content']);
            $path = "system/templates/{$tpl['slug']}.pdf";

            Storage::disk('documents')->put($path, $pdf);

            Template::create([
                'tenant_id'   => null,
                'user_id'     => null,
                'name'        => $tpl['name'],
                'description' => $tpl['description'],
                'file_path'   => $path,
            ]);
        }
    }

    private function buildPdf(string $title, string $body): string
    {
        $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
        $pdf->SetCreator('DocFlow');
        $pdf->SetTitle($title);
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->SetMargins(25, 20, 25);
        $pdf->SetAutoPageBreak(true, 20);
        $pdf->AddPage();

        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->SetTextColor(15, 23, 42);
        $pdf->Cell(0, 12, $title, 0, 1, 'C');

        $pdf->SetFont('helvetica', '', 8);
        $pdf->SetTextColor(100, 100, 100);
        $pdf->Cell(0, 6, 'Plantilla DocFlow — ' . now()->format('Y'), 0, 1, 'C');
        $pdf->Ln(4);

        $pdf->SetDrawColor(200, 200, 200);
        $pdf->Line(25, $pdf->GetY(), 185, $pdf->GetY());
        $pdf->Ln(6);

        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetTextColor(30, 30, 30);
        $pdf->writeHTMLCell(0, 0, '', '', $body, 0, 1);

        $pdf->Ln(10);
        $pdf->SetFont('helvetica', 'I', 9);
        $pdf->SetTextColor(120, 120, 120);
        $pdf->MultiCell(0, 5, 'Este documento es una plantilla orientativa. Consulte con un profesional jurídico antes de utilizarla en transacciones reales.', 0, 'C');

        $signatureY = $pdf->GetY() + 15;
        if ($signatureY > 240) {
            $pdf->AddPage();
            $signatureY = 30;
        }

        $pdf->SetY($signatureY);
        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetTextColor(30, 30, 30);
        $pdf->Cell(75, 6, 'Firma de la Parte A:', 0, 0);
        $pdf->Cell(10, 6, '', 0, 0);
        $pdf->Cell(75, 6, 'Firma de la Parte B:', 0, 1);
        $pdf->Ln(15);
        $pdf->Cell(75, 0.5, '', 'T', 0);
        $pdf->Cell(10, 0.5, '', 0, 0);
        $pdf->Cell(75, 0.5, '', 'T', 1);
        $pdf->Ln(3);
        $pdf->SetFont('helvetica', '', 9);
        $pdf->SetTextColor(100, 100, 100);
        $pdf->Cell(75, 5, 'Nombre: _______________________', 0, 0);
        $pdf->Cell(10, 5, '', 0, 0);
        $pdf->Cell(75, 5, 'Nombre: _______________________', 0, 1);
        $pdf->Cell(75, 5, 'Fecha: ________________________', 0, 0);
        $pdf->Cell(10, 5, '', 0, 0);
        $pdf->Cell(75, 5, 'Fecha: ________________________', 0, 1);

        return $pdf->Output('template.pdf', 'S');
    }

    const NDA_CONTENT = <<<HTML
<b>ACUERDO DE CONFIDENCIALIDAD Y NO DIVULGACIÓN</b><br><br>

En _________________, a _____ de ____________ de 20____<br><br>

<b>REUNIDOS</b><br><br>

De una parte, <b>DON/DÑA ___________________________</b>, con DNI/NIF n.º _____________, y domicilio en ___________________________ (en adelante, la <b>"Parte Divulgante"</b>).<br><br>

De otra parte, <b>DON/DÑA ___________________________</b>, con DNI/NIF n.º _____________, y domicilio en ___________________________ (en adelante, la <b>"Parte Receptora"</b>).<br><br>

Ambas partes se reconocen mutuamente plena capacidad legal para suscribir el presente acuerdo y, en virtud de lo anterior,<br><br>

<b>EXPONEN</b><br><br>

I. Que la Parte Divulgante posee determinada información confidencial relativa a ___________________________.<br><br>
II. Que la Parte Receptora está interesada en recibir dicha información con el propósito de ___________________________.<br><br>
III. Que ambas partes desean regular los términos y condiciones bajo los cuales se intercambiará la información confidencial.<br><br>

<b>CLÁUSULAS</b><br><br>

<b>Primera. Definición de Información Confidencial.</b><br>
Se considerará información confidencial cualquier información, dato, documento, know-how, procedimiento, código fuente, lista de clientes, estrategia comercial o cualquier otro material relacionado con el negocio de la Parte Divulgante, ya sea facilitado por escrito, verbalmente, en formato digital o por cualquier otro medio.<br><br>

<b>Segunda. Obligaciones de la Parte Receptora.</b><br>
La Parte Receptora se compromete a: (a) mantener estricta confidencialidad sobre la Información Confidencial; (b) no divulgar la Información Confidencial a terceros sin consentimiento previo y escrito de la Parte Divulgante; (c) utilizar la Información Confidencial exclusivamente para los fines establecidos en el presente acuerdo; (d) adoptar las medidas de seguridad razonables para proteger la Información Confidencial.<br><br>

<b>Tercera. Excepciones.</b><br>
Las obligaciones de confidencialidad no se aplicarán a información que: (a) sea o se convierta en información de dominio público sin culpa de la Parte Receptora; (b) sea conocida por la Parte Receptora con anterioridad a su divulgación; (c) sea recibida legítimamente de un tercero sin restricciones de confidencialidad; (d) deba ser divulgada por imperativo legal o judicial.<br><br>

<b>Cuarta. Vigencia.</b><br>
El presente acuerdo tendrá una vigencia de _____ años desde la fecha de su firma, sin perjuicio de que las obligaciones de confidencialidad se mantengan durante dicho período.<br><br>

<b>Quinta. Legislación aplicable y jurisdicción.</b><br>
El presente acuerdo se regirá por la legislación española. Para cualquier controversia, las partes se someten a los Juzgados y Tribunales de _________________.
HTML;

    const SERVICIOS_CONTENT = <<<HTML
<b>CONTRATO DE PRESTACIÓN DE SERVICIOS</b><br><br>

En _________________, a _____ de ____________ de 20____<br><br>

<b>PARTES</b><br><br>

<b>CLIENTE:</b> DON/DÑA ___________________________, con DNI/NIF n.º _____________,
domicilio en ___________________________, teléfono _______________, email _______________.<br><br>

<b>PRESTADOR:</b> DON/DÑA ___________________________, con DNI/NIF n.º _____________,
domicilio profesional en ___________________________, teléfono _______________, email _______________.<br><br>

<b>CLÁUSULAS</b><br><br>

<b>Primera. Objeto del contrato.</b><br>
El Prestador se compromete a prestar al Cliente los siguientes servicios: ___________________________. Los servicios se describen con detalle en el Anexo I adjunto al presente contrato.<br><br>

<b>Segunda. Plazo de ejecución.</b><br>
Los servicios objeto del presente contrato se prestarán desde el _____ de ____________ de 20____ hasta el _____ de ____________ de 20____. El Prestador comunicará al Cliente el estado de ejecución cuando sea requerido para ello.<br><br>

<b>Tercera. Honorarios y forma de pago.</b><br>
El Cliente abonará al Prestador la cantidad de _____________ euros (___________€), más IVA aplicable, de acuerdo con el siguiente calendario de pagos:<br>
- ___% a la firma del contrato: _________€<br>
- ___% a la entrega: _________€<br>
El pago se realizará mediante transferencia bancaria a la cuenta IBAN: ES__ ____ ____ __________.<br><br>

<b>Cuarta. Propiedad intelectual.</b><br>
Los trabajos, creaciones y entregables generados por el Prestador en ejecución de este contrato serán propiedad del Cliente una vez abonada la totalidad de los honorarios pactados.<br><br>

<b>Quinta. Confidencialidad.</b><br>
Ambas partes se comprometen a guardar la más estricta confidencialidad sobre la información que, con motivo de la ejecución del presente contrato, llegue a su conocimiento.<br><br>

<b>Sexta. Resolución del contrato.</b><br>
Cualquiera de las partes podrá resolver el presente contrato mediante comunicación escrita con un preaviso de _____ días. En caso de resolución anticipada por parte del Cliente, éste deberá abonar los honorarios correspondientes al trabajo efectivamente realizado.<br><br>

<b>Séptima. Legislación aplicable.</b><br>
El presente contrato se regirá por la legislación española. Para cualquier controversia, las partes se someten a los Juzgados y Tribunales de _________________.
HTML;

    const ARRENDAMIENTO_CONTENT = <<<HTML
<b>CONTRATO DE ARRENDAMIENTO DE VIVIENDA</b><br>
<i>(Conforme a la Ley 29/1994, de 24 de noviembre, de Arrendamientos Urbanos)</i><br><br>

En _________________, a _____ de ____________ de 20____<br><br>

<b>PARTES</b><br><br>

<b>ARRENDADOR:</b> DON/DÑA ___________________________, con DNI/NIF n.º _____________,
domicilio en ___________________________ (en adelante, el <b>"Arrendador"</b>).<br><br>

<b>ARRENDATARIO:</b> DON/DÑA ___________________________, con DNI/NIF n.º _____________,
domicilio en ___________________________ (en adelante, el <b>"Arrendatario"</b>).<br><br>

<b>CLÁUSULAS</b><br><br>

<b>Primera. Objeto.</b><br>
El Arrendador cede en arrendamiento al Arrendatario el inmueble sito en ___________________________, con referencia catastral _______________, que tiene una superficie de _____ m², compuesto de ___________________________. El inmueble se arrienda como vivienda habitual y permanente del Arrendatario.<br><br>

<b>Segunda. Duración.</b><br>
El presente contrato tendrá una duración de _____ años, comenzando el _____ de ____________ de 20____ y finalizando el _____ de ____________ de 20____. Conforme a la LAU, el contrato se prorrogará automáticamente por períodos anuales hasta alcanzar un mínimo de cinco (5) años, salvo que el Arrendatario manifieste su voluntad de no renovarlo con 30 días de antelación.<br><br>

<b>Tercera. Renta.</b><br>
La renta mensual pactada es de _____________ euros (___________€), pagadera dentro de los cinco primeros días de cada mes, mediante transferencia bancaria a la cuenta del Arrendador IBAN: ES__ ____ ____ __________. La renta se actualizará anualmente conforme al Índice de Garantía de Competitividad (IGC) publicado por el INE.<br><br>

<b>Cuarta. Fianza.</b><br>
El Arrendatario hace entrega en este acto de la cantidad de _____________ euros (___________€), equivalente a una mensualidad de renta, en concepto de fianza legal, que será depositada por el Arrendador en el organismo autonómico competente. La fianza será devuelta al Arrendatario en el plazo de 30 días desde la entrega de llaves, descontando, en su caso, los desperfectos causados en el inmueble.<br><br>

<b>Quinta. Gastos y suministros.</b><br>
Los gastos de comunidad, IBI y demás gastos generales serán a cargo del Arrendador. Los suministros de electricidad, agua, gas, telefonía e internet serán a cargo del Arrendatario, quien deberá tramitar el cambio de titularidad.<br><br>

<b>Sexta. Estado del inmueble y obras.</b><br>
El Arrendatario declara recibir el inmueble en perfecto estado de uso y habitabilidad, comprometiéndose a conservarlo y restituirlo en igual estado. No podrá realizar obras de modificación sin autorización escrita del Arrendador.<br><br>

<b>Séptima. Legislación aplicable.</b><br>
El presente contrato se regirá por la Ley 29/1994 de Arrendamientos Urbanos y, en lo no previsto, por el Código Civil español. Para cualquier controversia, las partes se someten a los Juzgados y Tribunales de _________________.
HTML;
}
