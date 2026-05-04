<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡DocFlow ya está disponible!</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr>
        <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

                {{-- Header festivo --}}
                <tr>
                    <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:32px;text-align:center;">
                        <p style="margin:0 0 8px;font-size:40px;">🎉</p>
                        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;letter-spacing:-0.3px;">DocFlow</h1>
                        <p style="margin:8px 0 0;color:#c7d2fe;font-size:15px;font-weight:500;">ya está oficialmente disponible</p>
                    </td>
                </tr>

                <tr>
                    <td style="padding:36px 32px;">
                        <p style="margin:0 0 16px;font-size:16px;color:#374151;">
                            Hola{{ $entry->name ? ', ' . $entry->name : '' }},
                        </p>

                        <p style="margin:0 0 20px;font-size:16px;color:#4b5563;line-height:1.7;font-weight:500;">
                            El momento que esperabas ha llegado. 🚀
                        </p>

                        <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.7;">
                            <strong>DocFlow está oficialmente disponible</strong> y tú, como miembro de nuestra lista de espera,
                            tienes acceso prioritario. Eres de los primeros en poder usar la plataforma.
                        </p>

                        {{-- Features --}}
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:28px;">
                            <tr><td style="padding:20px 24px;">
                                <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:0.5px;">Qué puedes hacer con DocFlow</p>
                                <table cellpadding="0" cellspacing="0" style="width:100%;">
                                    @foreach([
                                        ['✍️', 'Firma electrónica', 'Envía documentos PDF para firmar en segundos'],
                                        ['📋', 'Plantillas', 'Reutiliza documentos frecuentes con variables dinámicas'],
                                        ['👥', 'Equipos', 'Invita a tu equipo con roles personalizados'],
                                        ['🔌', 'API pública', 'Integra DocFlow en tus propias aplicaciones'],
                                    ] as [$icon, $title, $desc])
                                    <tr>
                                        <td style="padding:7px 0;vertical-align:top;width:30px;font-size:18px;">{{ $icon }}</td>
                                        <td style="padding:7px 0 7px 8px;">
                                            <strong style="font-size:14px;color:#1f2937;">{{ $title }}</strong>
                                            <span style="font-size:13px;color:#6b7280;"> — {{ $desc }}</span>
                                        </td>
                                    </tr>
                                    @endforeach
                                </table>
                            </td></tr>
                        </table>

                        {{-- Discount placeholder --}}
                        @if(env('WAITLIST_DISCOUNT_CODE'))
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;margin-bottom:28px;">
                            <tr><td style="padding:16px 20px;text-align:center;">
                                <p style="margin:0 0 6px;font-size:13px;color:#92400e;font-weight:600;">🎁 Tu código de descuento exclusivo</p>
                                <p style="margin:0;font-size:22px;font-weight:bold;color:#d97706;letter-spacing:2px;">{{ env('WAITLIST_DISCOUNT_CODE') }}</p>
                                <p style="margin:6px 0 0;font-size:12px;color:#a16207;">Introdúcelo al crear tu cuenta</p>
                            </td></tr>
                        </table>
                        @endif

                        {{-- CTA --}}
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                            <tr>
                                <td align="center">
                                    <a href="{{ $registerUrl }}"
                                       style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;padding:16px 48px;border-radius:10px;text-decoration:none;font-size:16px;font-weight:bold;letter-spacing:0.2px;">
                                        Crear mi cuenta gratis →
                                    </a>
                                </td>
                            </tr>
                        </table>

                        <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
                            O visita <a href="{{ env('APP_FRONTEND_URL', 'http://localhost:5173') }}" style="color:#6366f1;text-decoration:none;">docflow.es</a>
                        </p>
                    </td>
                </tr>

                <tr>
                    <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;">
                        <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
                            Recibiste este email porque te apuntaste a la lista de espera de DocFlow.
                        </p>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>
</body>
</html>
