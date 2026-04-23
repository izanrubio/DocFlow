<?php

namespace App\Services\Templates;

class NdaTemplateGenerator extends AbstractTemplateGenerator
{
    public function generate(array $values): string
    {
        $this->initPdf('Acuerdo de Confidencialidad (NDA)');
        $this->heading('ACUERDO DE CONFIDENCIALIDAD Y NO DIVULGACIÓN');

        $html = implode('', [
            "En {$this->v($values, 'ciudad')}, a {$this->v($values, 'fecha_dia')} de {$this->v($values, 'fecha_mes')} de {$this->v($values, 'fecha_ano')}<br><br>",
            "<b>REUNIDOS</b><br><br>",
            "De una parte, <b>{$this->v($values, 'parte_a_nombre')}</b>, con DNI/NIF n.º {$this->v($values, 'parte_a_dni')}, ",
            "y domicilio en {$this->v($values, 'parte_a_domicilio')} (en adelante, la <b>\"Parte Divulgante\"</b>).<br><br>",
            "De otra parte, <b>{$this->v($values, 'parte_b_nombre')}</b>, con DNI/NIF n.º {$this->v($values, 'parte_b_dni')}, ",
            "y domicilio en {$this->v($values, 'parte_b_domicilio')} (en adelante, la <b>\"Parte Receptora\"</b>).<br><br>",
            "Ambas partes se reconocen mutuamente plena capacidad legal para suscribir el presente acuerdo y, en virtud de lo anterior,<br><br>",
            "<b>EXPONEN</b><br><br>",
            "I. Que la Parte Divulgante posee determinada información confidencial relativa a {$this->v($values, 'objeto_informacion')}.<br><br>",
            "II. Que la Parte Receptora está interesada en recibir dicha información con el propósito de {$this->v($values, 'proposito')}.<br><br>",
            "III. Que ambas partes desean regular los términos y condiciones bajo los cuales se intercambiará la información confidencial.<br><br>",
            "<b>CLÁUSULAS</b><br><br>",
            "<b>Primera. Definición de Información Confidencial.</b><br>",
            "Se considerará información confidencial cualquier información, dato, documento, know-how, procedimiento, código fuente, lista de clientes, estrategia comercial o cualquier otro material relacionado con el negocio de la Parte Divulgante, ya sea facilitado por escrito, verbalmente, en formato digital o por cualquier otro medio.<br><br>",
            "<b>Segunda. Obligaciones de la Parte Receptora.</b><br>",
            "La Parte Receptora se compromete a: (a) mantener estricta confidencialidad sobre la Información Confidencial; (b) no divulgar la Información Confidencial a terceros sin consentimiento previo y escrito de la Parte Divulgante; (c) utilizar la Información Confidencial exclusivamente para los fines establecidos en el presente acuerdo; (d) adoptar las medidas de seguridad razonables para proteger la Información Confidencial.<br><br>",
            "<b>Tercera. Excepciones.</b><br>",
            "Las obligaciones de confidencialidad no se aplicarán a información que: (a) sea o se convierta en información de dominio público sin culpa de la Parte Receptora; (b) sea conocida por la Parte Receptora con anterioridad a su divulgación; (c) sea recibida legítimamente de un tercero sin restricciones de confidencialidad; (d) deba ser divulgada por imperativo legal o judicial.<br><br>",
            "<b>Cuarta. Vigencia.</b><br>",
            "El presente acuerdo tendrá una vigencia de {$this->v($values, 'vigencia_anos')} años desde la fecha de su firma.<br><br>",
            "<b>Quinta. Legislación aplicable y jurisdicción.</b><br>",
            "El presente acuerdo se regirá por la legislación española. Para cualquier controversia, las partes se someten a los Juzgados y Tribunales de {$this->v($values, 'jurisdiccion')}.",
        ]);

        $this->body($html);
        $this->disclaimer();
        $this->signatures('Parte Divulgante', 'Parte Receptora');

        return $this->output();
    }
}
