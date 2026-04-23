<?php

namespace App\Services\Templates;

class ContratosServiciosTemplateGenerator extends AbstractTemplateGenerator
{
    public function generate(array $values): string
    {
        $this->initPdf('Contrato de Prestación de Servicios');
        $this->heading('CONTRATO DE PRESTACIÓN DE SERVICIOS');

        $importe = $this->formatCurrency($values['importe'] ?? 0);

        $html = implode('', [
            "En {$this->v($values, 'ciudad')}, a {$this->v($values, 'fecha_dia')} de {$this->v($values, 'fecha_mes')} de {$this->v($values, 'fecha_ano')}<br><br>",
            "<b>PARTES</b><br><br>",
            "<b>CLIENTE:</b> <b>{$this->v($values, 'cliente_nombre')}</b>, con DNI/NIF n.º {$this->v($values, 'cliente_dni')}, ",
            "domicilio en {$this->v($values, 'cliente_domicilio')}.<br><br>",
            "<b>PRESTADOR:</b> <b>{$this->v($values, 'proveedor_nombre')}</b>, con DNI/NIF n.º {$this->v($values, 'proveedor_dni')}, ",
            "domicilio profesional en {$this->v($values, 'proveedor_domicilio')}.<br><br>",
            "<b>CLÁUSULAS</b><br><br>",
            "<b>Primera. Objeto del contrato.</b><br>",
            "El Prestador se compromete a prestar al Cliente los siguientes servicios: {$this->v($values, 'descripcion_servicios')}.<br><br>",
            "<b>Segunda. Plazo de ejecución.</b><br>",
            "La duración del presente contrato será de {$this->v($values, 'duracion')}.<br><br>",
            "<b>Tercera. Honorarios y forma de pago.</b><br>",
            "El Cliente abonará al Prestador la cantidad de {$importe}, más IVA aplicable. ",
            "Forma de pago: {$this->v($values, 'forma_pago')}.<br><br>",
            "<b>Cuarta. Propiedad intelectual.</b><br>",
            "Los trabajos, creaciones y entregables generados por el Prestador en ejecución de este contrato serán propiedad del Cliente una vez abonada la totalidad de los honorarios pactados.<br><br>",
            "<b>Quinta. Confidencialidad.</b><br>",
            "Ambas partes se comprometen a guardar la más estricta confidencialidad sobre la información que, con motivo de la ejecución del presente contrato, llegue a su conocimiento.<br><br>",
            "<b>Sexta. Resolución del contrato.</b><br>",
            "Cualquiera de las partes podrá resolver el presente contrato mediante comunicación escrita con preaviso. ",
            "En caso de resolución anticipada por parte del Cliente, éste deberá abonar los honorarios correspondientes al trabajo efectivamente realizado.<br><br>",
            "<b>Séptima. Legislación aplicable.</b><br>",
            "El presente contrato se regirá por la legislación española. Para cualquier controversia, las partes se someten a los Juzgados y Tribunales de {$this->v($values, 'jurisdiccion')}.",
        ]);

        $this->body($html);
        $this->disclaimer();
        $this->signaturesPage('Cliente', 'Prestador');

        return $this->output();
    }

    public function getSignaturePositions(): array
    {
        return [
            [
                'signer_order' => 1,
                'page'         => $this->signaturePage,
                'x'            => 25,
                'y'            => 40,
                'width'        => 75,
                'height'       => 30,
                'label'        => 'Cliente',
            ],
            [
                'signer_order' => 2,
                'page'         => $this->signaturePage,
                'x'            => 110,
                'y'            => 40,
                'width'        => 75,
                'height'       => 30,
                'label'        => 'Prestador',
            ],
        ];
    }
}
