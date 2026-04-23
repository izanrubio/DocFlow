<?php

namespace App\Services\Templates;

use App\Models\Template;

class TemplateGeneratorFactory
{
    private static array $map = [
        'nda'           => NdaTemplateGenerator::class,
        'servicios'     => ContratosServiciosTemplateGenerator::class,
        'arrendamiento' => ArrendamientoTemplateGenerator::class,
    ];

    public static function make(Template $template): ?TemplateGeneratorInterface
    {
        return self::makeBySlug($template->slug ?? '');
    }

    public static function makeBySlug(string $slug): ?TemplateGeneratorInterface
    {
        $class = self::$map[$slug] ?? null;
        return $class ? new $class() : null;
    }
}
