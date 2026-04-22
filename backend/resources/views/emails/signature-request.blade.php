<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solicitud de firma</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr>
        <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

                <tr>
                    <td style="background:#4f46e5;padding:24px 32px;">
                        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:-0.3px;">DocFlow</h1>
                        <p style="margin:4px 0 0;color:#c7d2fe;font-size:13px;">Firma electrónica de documentos</p>
                    </td>
                </tr>

                <tr>
                    <td style="padding:32px;">
                        <p style="margin:0 0 16px;font-size:16px;color:#374151;">
                            Hola <strong>{{ $signer->name }}</strong>,
                        </p>
                        <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
                            <strong>{{ $document->user->name }}</strong> te solicita que firmes el siguiente documento:
                        </p>

                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:28px;">
                            <tr>
                                <td style="padding:18px 20px;">
                                    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#9ca3af;">Documento</p>
                                    <p style="margin:0;font-size:18px;font-weight:bold;color:#111827;">{{ $document->title }}</p>
                                    @if($document->expires_at)
                                    <p style="margin:8px 0 0;font-size:13px;color:#ef4444;">
                                        ⏰ Fecha límite: {{ $document->expires_at->format('d/m/Y') }}
                                    </p>
                                    @endif
                                </td>
                            </tr>
                        </table>

                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                            <tr>
                                <td align="center">
                                    <a href="{{ $signUrl }}"
                                       style="display:inline-block;background:#4f46e5;color:#ffffff;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;letter-spacing:0.2px;">
                                        Revisar y firmar documento →
                                    </a>
                                </td>
                            </tr>
                        </table>

                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;margin-bottom:24px;">
                            <tr>
                                <td style="padding:14px 18px;">
                                    <p style="margin:0;font-size:13px;color:#1d4ed8;line-height:1.5;">
                                        ✅ <strong>No necesitas cuenta en DocFlow.</strong>
                                        Haz clic en el botón para acceder directamente al documento y firmarlo online.
                                    </p>
                                </td>
                            </tr>
                        </table>

                        <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;">
                            Si el botón no funciona, copia y pega esta URL en tu navegador:<br>
                            <span style="color:#6366f1;word-break:break-all;">{{ $signUrl }}</span>
                        </p>
                    </td>
                </tr>

                <tr>
                    <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;">
                        <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
                            Este email fue enviado automáticamente por DocFlow. Si no esperabas esta solicitud de firma, puedes ignorar este mensaje de forma segura.
                        </p>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>
</body>
</html>
