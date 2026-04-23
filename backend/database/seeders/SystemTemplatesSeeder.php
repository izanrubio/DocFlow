<?php

namespace Database\Seeders;

use App\Models\Template;
use App\Services\Templates\TemplateGeneratorFactory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class SystemTemplatesSeeder extends Seeder
{
    private array $templates = [
        [
            'slug'        => 'nda',
            'name'        => 'Acuerdo de Confidencialidad (NDA)',
            'description' => 'Acuerdo de no divulgación estándar entre dos partes. Incluye cláusulas sobre información confidencial, obligaciones de las partes y vigencia.',
            'variables'   => [
                ['key' => 'ciudad',           'label' => 'Ciudad',                          'type' => 'text',     'required' => true],
                ['key' => 'fecha_dia',        'label' => 'Día',                             'type' => 'text',     'required' => true],
                ['key' => 'fecha_mes',        'label' => 'Mes',                             'type' => 'text',     'required' => true],
                ['key' => 'fecha_ano',        'label' => 'Año',                             'type' => 'text',     'required' => true],
                ['key' => 'parte_a_nombre',   'label' => 'Nombre (Parte Divulgante)',        'type' => 'text',     'required' => true],
                ['key' => 'parte_a_dni',      'label' => 'DNI/NIF (Parte Divulgante)',       'type' => 'text',     'required' => true],
                ['key' => 'parte_a_domicilio','label' => 'Domicilio (Parte Divulgante)',     'type' => 'text',     'required' => true],
                ['key' => 'parte_b_nombre',   'label' => 'Nombre (Parte Receptora)',         'type' => 'text',     'required' => true],
                ['key' => 'parte_b_dni',      'label' => 'DNI/NIF (Parte Receptora)',        'type' => 'text',     'required' => true],
                ['key' => 'parte_b_domicilio','label' => 'Domicilio (Parte Receptora)',      'type' => 'text',     'required' => true],
                ['key' => 'objeto_informacion','label' => 'Objeto de la información confidencial', 'type' => 'textarea', 'required' => true],
                ['key' => 'proposito',        'label' => 'Propósito de la divulgación',     'type' => 'textarea', 'required' => true],
                ['key' => 'vigencia_anos',    'label' => 'Vigencia (años)',                  'type' => 'number',   'required' => true],
                ['key' => 'jurisdiccion',     'label' => 'Jurisdicción',                    'type' => 'text',     'required' => true],
            ],
            'example_values' => [
                'ciudad'            => 'Madrid',
                'fecha_dia'         => '1',
                'fecha_mes'         => 'enero',
                'fecha_ano'         => '2026',
                'parte_a_nombre'    => 'EMPRESA EJEMPLO, S.L.',
                'parte_a_dni'       => 'B12345678',
                'parte_a_domicilio' => 'Calle Ejemplo 1, 28001 Madrid',
                'parte_b_nombre'    => 'COLABORADOR EJEMPLO',
                'parte_b_dni'       => '12345678A',
                'parte_b_domicilio' => 'Calle Ejemplo 2, 08001 Barcelona',
                'objeto_informacion'=> 'información comercial y tecnológica relativa al proyecto',
                'proposito'         => 'evaluar una posible colaboración comercial',
                'vigencia_anos'     => '2',
                'jurisdiccion'      => 'Madrid',
            ],
        ],
        [
            'slug'        => 'servicios',
            'name'        => 'Contrato de Prestación de Servicios',
            'description' => 'Contrato para autónomos y freelance. Incluye descripción de servicios, honorarios, plazos y condiciones de pago.',
            'variables'   => [
                ['key' => 'ciudad',              'label' => 'Ciudad',                     'type' => 'text',     'required' => true],
                ['key' => 'fecha_dia',           'label' => 'Día',                        'type' => 'text',     'required' => true],
                ['key' => 'fecha_mes',           'label' => 'Mes',                        'type' => 'text',     'required' => true],
                ['key' => 'fecha_ano',           'label' => 'Año',                        'type' => 'text',     'required' => true],
                ['key' => 'cliente_nombre',      'label' => 'Nombre del cliente',         'type' => 'text',     'required' => true],
                ['key' => 'cliente_dni',         'label' => 'DNI/NIF del cliente',        'type' => 'text',     'required' => true],
                ['key' => 'cliente_domicilio',   'label' => 'Domicilio del cliente',      'type' => 'text',     'required' => true],
                ['key' => 'proveedor_nombre',    'label' => 'Nombre del prestador',       'type' => 'text',     'required' => true],
                ['key' => 'proveedor_dni',       'label' => 'DNI/NIF del prestador',      'type' => 'text',     'required' => true],
                ['key' => 'proveedor_domicilio', 'label' => 'Domicilio del prestador',    'type' => 'text',     'required' => true],
                ['key' => 'descripcion_servicios','label' => 'Descripción de los servicios', 'type' => 'textarea', 'required' => true],
                ['key' => 'importe',             'label' => 'Importe total (€)',          'type' => 'number',   'required' => true],
                ['key' => 'forma_pago',          'label' => 'Forma de pago',              'type' => 'text',     'required' => true],
                ['key' => 'duracion',            'label' => 'Duración del contrato',      'type' => 'text',     'required' => true],
                ['key' => 'jurisdiccion',        'label' => 'Jurisdicción',               'type' => 'text',     'required' => true],
            ],
            'example_values' => [
                'ciudad'               => 'Madrid',
                'fecha_dia'            => '1',
                'fecha_mes'            => 'enero',
                'fecha_ano'            => '2026',
                'cliente_nombre'       => 'CLIENTE EJEMPLO, S.L.',
                'cliente_dni'          => 'B87654321',
                'cliente_domicilio'    => 'Calle Cliente 1, 28001 Madrid',
                'proveedor_nombre'     => 'PRESTADOR EJEMPLO',
                'proveedor_dni'        => '87654321B',
                'proveedor_domicilio'  => 'Calle Prestador 1, 08001 Barcelona',
                'descripcion_servicios'=> 'desarrollo de software a medida según especificaciones del cliente',
                'importe'              => '5000',
                'forma_pago'           => 'transferencia bancaria a la firma y a la entrega',
                'duracion'             => '3 meses',
                'jurisdiccion'         => 'Madrid',
            ],
        ],
        [
            'slug'        => 'arrendamiento',
            'name'        => 'Contrato de Arrendamiento',
            'description' => 'Contrato de alquiler de inmueble conforme a la LAU. Incluye descripción del inmueble, renta, fianza y condiciones generales.',
            'variables'   => [
                ['key' => 'ciudad',               'label' => 'Ciudad',                      'type' => 'text',     'required' => true],
                ['key' => 'fecha_dia',            'label' => 'Día',                         'type' => 'text',     'required' => true],
                ['key' => 'fecha_mes',            'label' => 'Mes',                         'type' => 'text',     'required' => true],
                ['key' => 'fecha_ano',            'label' => 'Año',                         'type' => 'text',     'required' => true],
                ['key' => 'arrendador_nombre',    'label' => 'Nombre del arrendador',       'type' => 'text',     'required' => true],
                ['key' => 'arrendador_dni',       'label' => 'DNI/NIF del arrendador',      'type' => 'text',     'required' => true],
                ['key' => 'arrendatario_nombre',  'label' => 'Nombre del arrendatario',     'type' => 'text',     'required' => true],
                ['key' => 'arrendatario_dni',     'label' => 'DNI/NIF del arrendatario',    'type' => 'text',     'required' => true],
                ['key' => 'inmueble_direccion',   'label' => 'Dirección del inmueble',      'type' => 'text',     'required' => true],
                ['key' => 'inmueble_descripcion', 'label' => 'Descripción del inmueble',    'type' => 'textarea', 'required' => true],
                ['key' => 'renta_mensual',        'label' => 'Renta mensual (€)',           'type' => 'number',   'required' => true],
                ['key' => 'fianza',               'label' => 'Fianza (€)',                  'type' => 'number',   'required' => true],
                ['key' => 'duracion_anos',        'label' => 'Duración (años)',             'type' => 'number',   'required' => true],
                ['key' => 'fecha_inicio',         'label' => 'Fecha de inicio',             'type' => 'date',     'required' => true],
                ['key' => 'jurisdiccion',         'label' => 'Jurisdicción',                'type' => 'text',     'required' => true],
            ],
            'example_values' => [
                'ciudad'               => 'Madrid',
                'fecha_dia'            => '1',
                'fecha_mes'            => 'enero',
                'fecha_ano'            => '2026',
                'arrendador_nombre'    => 'PROPIETARIO EJEMPLO',
                'arrendador_dni'       => '11111111A',
                'arrendatario_nombre'  => 'INQUILINO EJEMPLO',
                'arrendatario_dni'     => '22222222B',
                'inmueble_direccion'   => 'Calle Inmueble 1, Piso 1A, 28001 Madrid',
                'inmueble_descripcion' => 'piso de 80 m², compuesto de salón, cocina, dos dormitorios y baño',
                'renta_mensual'        => '1000',
                'fianza'               => '1000',
                'duracion_anos'        => '1',
                'fecha_inicio'         => '2026-01-01',
                'jurisdiccion'         => 'Madrid',
            ],
        ],
    ];

    public function run(): void
    {
        foreach ($this->templates as $tpl) {
            $generator  = TemplateGeneratorFactory::makeBySlug($tpl['slug']);
            $pdfContent = $generator->generate($tpl['example_values']);
            $path       = "system/templates/{$tpl['slug']}.pdf";

            Storage::disk('documents')->put($path, $pdfContent);

            Template::updateOrCreate(
                ['slug' => $tpl['slug']],
                [
                    'tenant_id'   => null,
                    'user_id'     => null,
                    'name'        => $tpl['name'],
                    'description' => $tpl['description'],
                    'file_path'   => $path,
                    'variables'   => $tpl['variables'],
                ]
            );
        }
    }
}
