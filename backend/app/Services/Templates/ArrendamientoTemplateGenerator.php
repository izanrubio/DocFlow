<?php

namespace App\Services\Templates;

class ArrendamientoTemplateGenerator extends AbstractTemplateGenerator
{
    public function generate(array $values): string
    {
        $this->initPdf('Contrato de Arrendamiento');
        $this->heading(
            'CONTRATO DE ARRENDAMIENTO DE VIVIENDA',
            '(Conforme a la Ley 29/1994, de 24 de noviembre, de Arrendamientos Urbanos)'
        );

        $renta  = $this->formatCurrency($values['renta_mensual'] ?? 0);
        $fianza = $this->formatCurrency($values['fianza'] ?? 0);
        $fechaInicio = isset($values['fecha_inicio']) ? $this->formatDate($values['fecha_inicio']) : '___';

        $html = implode('', [
            "En {$this->v($values, 'ciudad')}, a {$this->v($values, 'fecha_dia')} de {$this->v($values, 'fecha_mes')} de {$this->v($values, 'fecha_ano')}<br><br>",
            "<b>PARTES</b><br><br>",
            "<b>ARRENDADOR:</b> <b>{$this->v($values, 'arrendador_nombre')}</b>, con DNI/NIF n.º {$this->v($values, 'arrendador_dni')} ",
            "(en adelante, el <b>\"Arrendador\"</b>).<br><br>",
            "<b>ARRENDATARIO:</b> <b>{$this->v($values, 'arrendatario_nombre')}</b>, con DNI/NIF n.º {$this->v($values, 'arrendatario_dni')} ",
            "(en adelante, el <b>\"Arrendatario\"</b>).<br><br>",
            "<b>CLÁUSULAS</b><br><br>",
            "<b>Primera. Objeto.</b><br>",
            "El Arrendador cede en arrendamiento al Arrendatario el inmueble sito en {$this->v($values, 'inmueble_direccion')}. ",
            "Descripción: {$this->v($values, 'inmueble_descripcion')}. ",
            "El inmueble se arrienda como vivienda habitual y permanente del Arrendatario.<br><br>",
            "<b>Segunda. Duración.</b><br>",
            "El presente contrato tendrá una duración de {$this->v($values, 'duracion_anos')} años, comenzando el {$fechaInicio}. ",
            "Conforme a la LAU, el contrato se prorrogará automáticamente por períodos anuales hasta alcanzar un mínimo de cinco (5) años, ",
            "salvo que el Arrendatario manifieste su voluntad de no renovarlo con 30 días de antelación.<br><br>",
            "<b>Tercera. Renta.</b><br>",
            "La renta mensual pactada es de {$renta}, pagadera dentro de los cinco primeros días de cada mes, mediante transferencia bancaria. ",
            "La renta se actualizará anualmente conforme al Índice de Garantía de Competitividad (IGC) publicado por el INE.<br><br>",
            "<b>Cuarta. Fianza.</b><br>",
            "El Arrendatario entrega en este acto {$fianza} en concepto de fianza legal, que será depositada por el Arrendador en el organismo autonómico competente. ",
            "La fianza será devuelta en el plazo de 30 días desde la entrega de llaves, descontando los desperfectos causados.<br><br>",
            "<b>Quinta. Gastos y suministros.</b><br>",
            "Los gastos de comunidad, IBI y demás gastos generales serán a cargo del Arrendador. ",
            "Los suministros de electricidad, agua, gas, telefonía e internet serán a cargo del Arrendatario.<br><br>",
            "<b>Sexta. Estado del inmueble y obras.</b><br>",
            "El Arrendatario declara recibir el inmueble en perfecto estado de uso y habitabilidad, comprometiéndose a conservarlo y restituirlo en igual estado. ",
            "No podrá realizar obras de modificación sin autorización escrita del Arrendador.<br><br>",
            "<b>Séptima. Legislación aplicable.</b><br>",
            "El presente contrato se regirá por la Ley 29/1994 de Arrendamientos Urbanos y, en lo no previsto, por el Código Civil español. ",
            "Para cualquier controversia, las partes se someten a los Juzgados y Tribunales de {$this->v($values, 'jurisdiccion')}.",
        ]);

        $this->body($html);
        $this->disclaimer();
        $this->signatures('Arrendador', 'Arrendatario');

        return $this->output();
    }
}
