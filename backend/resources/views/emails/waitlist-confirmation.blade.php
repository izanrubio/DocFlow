<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estás en la lista — DocFlow</title>
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
                            Hola{{ $entry->name ? ', ' . $entry->name : '' }},
                        </p>

                        <p style="margin:0 0 20px;font-size:15px;color:#4b5563;line-height:1.6;">
                            🎉 <strong>Has reservado tu sitio en la lista de espera de DocFlow.</strong>
                        </p>

                        <p style="margin:0 0 20px;font-size:15px;color:#4b5563;line-height:1.6;">
                            DocFlow es una plataforma de firma electrónica de documentos diseñada para equipos y empresas que quieren agilizar sus procesos de firma.
                            Sube PDFs, añade firmantes y recibe los documentos firmados automáticamente, todo desde el navegador.
                        </p>

                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:8px;margin-bottom:24px;">
                            <tr>
                                <td style="padding:18px 20px;text-align:center;">
                                    <p style="margin:0 0 4px;font-size:13px;color:#6366f1;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Tu posición en la lista</p>
                                    <p style="margin:0;font-size:36px;font-weight:bold;color:#4f46e5;">#{{ $position }}</p>
                                </td>
                            </tr>
                        </table>

                        <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
                            Serás de los primeros en saber cuando abramos las puertas. No compartiremos tu email con nadie.
                        </p>

                        <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
                            Mientras tanto, puedes conocer más en <a href="{{ env('APP_FRONTEND_URL', 'http://localhost:5173') }}" style="color:#6366f1;text-decoration:none;">docflow.es</a>
                        </p>
                    </td>
                </tr>

                <tr>
                    <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;">
                        <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
                            Recibiste este email porque te apuntaste a la lista de espera de DocFlow en
                            {{ $entry->created_at->format('d/m/Y') }}.
                            Si no fuiste tú, puedes ignorar este mensaje.
                        </p>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>
</body>
</html>
