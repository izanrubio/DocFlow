<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Documento rechazado</title>
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
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                            <tr>
                                <td align="center">
                                    <div style="width:64px;height:64px;background:#fee2e2;border-radius:50%;display:inline-block;line-height:64px;text-align:center;font-size:32px;">✗</div>
                                </td>
                            </tr>
                        </table>

                        <h2 style="margin:0 0 8px;font-size:20px;color:#111827;text-align:center;">Documento rechazado</h2>
                        <p style="margin:0 0 28px;font-size:15px;color:#4b5563;line-height:1.6;text-align:center;">
                            Hola <strong>{{ $document->user->name }}</strong>, uno de los firmantes ha rechazado tu documento.
                        </p>

                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:20px;">
                            <tr>
                                <td style="padding:18px 20px;">
                                    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#9ca3af;">Documento</p>
                                    <p style="margin:0;font-size:18px;font-weight:bold;color:#111827;">{{ $document->title }}</p>
                                </td>
                            </tr>
                        </table>

                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff1f2;border:1px solid #fecdd3;border-radius:8px;margin-bottom:20px;">
                            <tr>
                                <td style="padding:18px 20px;">
                                    <p style="margin:0 0 10px;font-size:13px;font-weight:bold;color:#9f1239;">Rechazado por</p>
                                    <p style="margin:0 0 4px;font-size:15px;font-weight:bold;color:#1f2937;">{{ $signer->name }}</p>
                                    <p style="margin:0 0 14px;font-size:13px;color:#6b7280;">{{ $signer->email }}</p>
                                    <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#9f1239;">Motivo del rechazo</p>
                                    <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;font-style:italic;">"{{ $reason }}"</p>
                                </td>
                            </tr>
                        </table>

                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin-bottom:28px;">
                            <tr>
                                <td style="padding:14px 18px;">
                                    <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                                        💡 Puedes crear un nuevo documento con las modificaciones necesarias y enviarlo de nuevo a los firmantes.
                                    </p>
                                </td>
                            </tr>
                        </table>

                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                            <tr>
                                <td align="center">
                                    <a href="{{ $documentUrl }}"
                                       style="display:inline-block;background:#4f46e5;color:#ffffff;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;letter-spacing:0.2px;">
                                        Ver documento →
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;">
                        <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
                            Este email fue generado automáticamente por DocFlow. No respondas a este mensaje.
                        </p>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>
</body>
</html>
