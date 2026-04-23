<?php

namespace App\Services\Templates;

interface TemplateGeneratorInterface
{
    public function generate(array $values): string;
}
