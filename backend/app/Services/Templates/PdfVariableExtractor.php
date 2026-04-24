<?php

namespace App\Services\Templates;

use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser;

class PdfVariableExtractor
{
    public function extract(string $filePath): array
    {
        $tmp = sys_get_temp_dir() . '/' . uniqid('pdfext_') . '.pdf';

        try {
            file_put_contents($tmp, Storage::disk('documents')->get($filePath));

            $parser = new Parser();
            $pdf    = $parser->parseFile($tmp);
            $text   = $pdf->getText();

            preg_match_all('/\{\{([a-z][a-z0-9_]*)\}\}/i', $text, $matches);

            $keys = array_unique(
                array_map('strtolower', $matches[1])
            );

            return array_values(array_map(fn (string $key) => [
                'key'      => $key,
                'label'    => $this->keyToLabel($key),
                'type'     => $this->inferType($key),
                'required' => true,
            ], $keys));
        } catch (\Throwable) {
            return [];
        } finally {
            @unlink($tmp);
        }
    }

    private function keyToLabel(string $key): string
    {
        return ucfirst(str_replace('_', ' ', $key));
    }

    private function inferType(string $key): string
    {
        if (preg_match('/fecha|date/', $key))                                   return 'date';
        if (preg_match('/importe|precio|cantidad|renta|fianza/', $key))         return 'number';
        if (preg_match('/descripcion|detalle|observacion|notas|descripción/', $key)) return 'textarea';
        return 'text';
    }
}
