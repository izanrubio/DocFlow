import { Link } from 'react-router-dom';

function LegalNav() {
    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
                <Link to="/" className="text-lg font-bold text-indigo-600">DocFlow</Link>
                <Link
                    to="/login"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                    Iniciar sesión
                </Link>
            </div>
        </header>
    );
}

function LegalFooter() {
    return (
        <footer className="bg-gray-900 text-gray-400 py-10 mt-16">
            <div className="max-w-3xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
                <span className="font-bold text-white">DocFlow</span>
                <nav className="flex gap-6">
                    <Link to="/privacy" className="hover:text-white transition-colors">Privacidad</Link>
                    <Link to="/terms" className="hover:text-white transition-colors">Términos</Link>
                    <Link to="/pricing" className="hover:text-white transition-colors">Precios</Link>
                </nav>
                <p>© 2026 DocFlow. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
}

const SECTIONS = [
    { id: 'objeto',           label: '1. Objeto y aceptación' },
    { id: 'registro',         label: '2. Registro y cuenta' },
    { id: 'uso',              label: '3. Uso del servicio' },
    { id: 'firma',            label: '4. Firma electrónica' },
    { id: 'facturacion',      label: '5. Planes y facturación' },
    { id: 'propiedad',        label: '6. Propiedad intelectual' },
    { id: 'responsabilidad',  label: '7. Limitación de responsabilidad' },
    { id: 'legislacion',      label: '8. Legislación aplicable' },
    { id: 'contacto',         label: '9. Contacto' },
];

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-gray-50">
            <LegalNav />

            <div className="max-w-3xl mx-auto px-5 py-10">
                {/* Breadcrumb */}
                <nav className="text-sm text-gray-400 mb-8 flex items-center gap-1.5">
                    <Link to="/" className="hover:text-gray-600 transition-colors">Inicio</Link>
                    <span>/</span>
                    <span className="text-gray-500">Legal</span>
                    <span>/</span>
                    <span className="text-gray-700 font-medium">Términos de uso</span>
                </nav>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Términos de uso</h1>
                <p className="text-sm text-gray-400 mb-10">Última actualización: 27 de abril de 2026</p>

                {/* TOC */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-10">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Índice</p>
                    <ol className="space-y-1.5">
                        {SECTIONS.map(({ id, label }) => (
                            <li key={id}>
                                <a
                                    href={`#${id}`}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                                >
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-12 text-gray-700 leading-relaxed">

                    <p className="text-sm text-gray-500">
                        Los presentes Términos de uso regulan el acceso y la utilización de DocFlow, un servicio
                        de firma electrónica de documentos disponible en línea. La utilización del servicio implica
                        la aceptación plena y sin reservas de estos términos.
                    </p>

                    {/* 1 */}
                    <section id="objeto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">1. Objeto y aceptación</h2>
                        <div className="text-sm space-y-3">
                            <p>
                                DocFlow es un servicio SaaS de firma electrónica que permite a sus usuarios subir
                                documentos en formato PDF, invitar a firmantes mediante email y obtener documentos
                                firmados electrónicamente con validez legal en España y en la Unión Europea conforme
                                al Reglamento (UE) N.º 910/2014 (eIDAS).
                            </p>
                            <p>
                                Al completar el proceso de registro y marcar la casilla de aceptación, el usuario
                                declara haber leído, comprendido y aceptado estos Términos de uso en su totalidad.
                                Si no estás de acuerdo con alguno de los términos, no debes utilizar el servicio.
                            </p>
                        </div>
                    </section>

                    {/* 2 */}
                    <section id="registro">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">2. Registro y cuenta</h2>
                        <div className="text-sm space-y-3">
                            <p>
                                <strong>Requisitos:</strong> para registrarse en DocFlow es necesario ser mayor de
                                18 años y proporcionar información veraz, actualizada y completa. El uso del servicio
                                en nombre de una empresa implica que tienes autorización para vincular a dicha empresa.
                            </p>
                            <p>
                                <strong>Seguridad de la contraseña:</strong> eres el único responsable de mantener
                                la confidencialidad de las credenciales de acceso a tu cuenta. DocFlow no se
                                responsabiliza de los daños derivados de un acceso no autorizado producido como
                                consecuencia de no haber protegido adecuadamente tus credenciales. Debes notificarnos
                                de inmediato cualquier uso no autorizado de tu cuenta.
                            </p>
                            <p>
                                <strong>Verificación de email:</strong> para activar tu cuenta es necesario verificar
                                tu dirección de correo electrónico mediante el enlace que te enviamos al registrarte.
                            </p>
                        </div>
                    </section>

                    {/* 3 */}
                    <section id="uso">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">3. Uso del servicio</h2>
                        <div className="text-sm space-y-4">
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Usos permitidos</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Enviar documentos legítimos para firma electrónica.</li>
                                    <li>Gestionar contratos, acuerdos y documentación empresarial.</li>
                                    <li>Usar plantillas para agilizar flujos de trabajo documentales.</li>
                                    <li>Integrar el servicio en tus procesos internos dentro de los límites del plan contratado.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Usos prohibidos</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Enviar documentos con contenido ilegal, fraudulento, difamatorio o que vulnere derechos de terceros.</li>
                                    <li>Usar el servicio para envíos masivos no solicitados (spam).</li>
                                    <li>Intentar obtener la firma de personas haciéndose pasar por otra entidad.</li>
                                    <li>Realizar ingeniería inversa, descompilar o intentar acceder al código fuente del servicio.</li>
                                    <li>Usar herramientas automatizadas para sobrecargar o degradar el rendimiento del servicio.</li>
                                    <li>Revender o sublicenciar el acceso al servicio a terceros sin autorización expresa.</li>
                                </ul>
                            </div>
                            <p>
                                El incumplimiento de estas condiciones puede resultar en la suspensión o cancelación
                                inmediata de la cuenta, sin derecho a reembolso.
                            </p>
                        </div>
                    </section>

                    {/* 4 */}
                    <section id="firma">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">4. Firma electrónica</h2>
                        <div className="text-sm space-y-3">
                            <p>
                                <strong>Validez legal:</strong> las firmas electrónicas generadas con DocFlow son
                                firmas electrónicas simples en el sentido del Reglamento eIDAS. Son legalmente
                                vinculantes en España y en todos los estados miembros de la Unión Europea para
                                la mayoría de documentos comerciales. Algunos tipos de documentos requieren firmas
                                cualificadas o formas específicas; el usuario es responsable de determinar el nivel
                                de firma adecuado para cada caso.
                            </p>
                            <p>
                                <strong>Responsabilidad del contenido:</strong> el usuario que sube el documento
                                es el único responsable de su contenido, exactitud y legalidad. DocFlow actúa
                                como intermediario técnico y no revisa ni valida el contenido de los documentos.
                            </p>
                            <p>
                                <strong>Verificación de identidad:</strong> DocFlow verifica la identidad de los
                                firmantes exclusivamente a través del email: se envía un enlace único al email
                                del firmante. DocFlow no realiza verificación de identidad documental (DNI,
                                pasaporte u otros). Si tu caso de uso requiere verificación de identidad más
                                robusta, debes implementarla por tu cuenta antes de enviar el documento.
                            </p>
                            <p>
                                <strong>Registro de auditoría:</strong> cada firma incluye un registro de auditoría
                                con la IP, el user agent y la marca temporal. Este registro se adjunta al documento
                                firmado y puede servir como evidencia en caso de disputa.
                            </p>
                        </div>
                    </section>

                    {/* 5 */}
                    <section id="facturacion">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">5. Planes y facturación</h2>
                        <div className="text-sm space-y-3">
                            <p>
                                <strong>Planes disponibles:</strong> DocFlow ofrece un plan gratuito con
                                funcionalidades limitadas y planes de pago (Pro y Business) con mayores límites
                                y funcionalidades adicionales. Los detalles de cada plan están disponibles en
                                la página de{' '}
                                <Link to="/pricing" className="text-indigo-600 hover:underline">precios</Link>.
                            </p>
                            <p>
                                <strong>Facturación:</strong> los planes de pago se facturan mensualmente por
                                adelantado. Los pagos se procesan a través de Stripe. Los precios mostrados
                                no incluyen IVA; el IVA aplicable se añadirá según la legislación española
                                vigente (actualmente 21% para servicios digitales).
                            </p>
                            <p>
                                <strong>Cancelación:</strong> puedes cancelar tu suscripción en cualquier momento
                                desde el panel de facturación. La cancelación tiene efecto al final del período
                                de facturación en curso; podrás seguir usando el servicio hasta esa fecha.
                            </p>
                            <p>
                                <strong>Reembolsos:</strong> no se realizan reembolsos por períodos parciales ya
                                facturados. Si cancelas antes del fin del período, mantendrás el acceso al plan
                                hasta la fecha de renovación sin cargos adicionales.
                            </p>
                            <p>
                                <strong>Impago:</strong> en caso de impago, la cuenta pasará automáticamente al
                                plan gratuito. Los documentos ya firmados se conservarán según lo indicado en la
                                Política de privacidad.
                            </p>
                        </div>
                    </section>

                    {/* 6 */}
                    <section id="propiedad">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">6. Propiedad intelectual</h2>
                        <div className="text-sm space-y-3">
                            <p>
                                <strong>DocFlow:</strong> todos los derechos de propiedad intelectual sobre el
                                software, diseño, marca, logotipos y demás elementos del servicio son propiedad
                                de sus creadores. El uso del servicio no te otorga ningún derecho de propiedad
                                sobre estos elementos.
                            </p>
                            <p>
                                <strong>Tus documentos:</strong> los documentos que subes a DocFlow son de tu
                                exclusiva propiedad. DocFlow no reclama ningún derecho sobre el contenido de
                                tus documentos y solo los almacena para prestarte el servicio contratado.
                            </p>
                            <p>
                                <strong>Licencia de uso:</strong> al subir documentos a la plataforma, nos
                                otorgas una licencia limitada, no exclusiva y revocable para almacenarlos,
                                procesarlos y enviarlos únicamente con el fin de prestar el servicio.
                            </p>
                        </div>
                    </section>

                    {/* 7 */}
                    <section id="responsabilidad">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">7. Limitación de responsabilidad</h2>
                        <div className="text-sm space-y-3">
                            <p>
                                <strong>Contenido de los documentos:</strong> DocFlow no se responsabiliza del
                                contenido de los documentos gestionados a través de la plataforma, ni de las
                                consecuencias jurídicas o económicas derivadas de los mismos.
                            </p>
                            <p>
                                <strong>Disponibilidad del servicio:</strong> DocFlow se presta "tal cual" y en
                                régimen de mejor esfuerzo (best-effort). No garantizamos una disponibilidad del
                                100%. Nos comprometemos a minimizar las interrupciones y a comunicar con antelación
                                los mantenimientos programados.
                            </p>
                            <p>
                                <strong>Límite de responsabilidad:</strong> en ningún caso la responsabilidad
                                total de DocFlow frente a un usuario podrá superar el importe abonado por dicho
                                usuario en los últimos 3 meses anteriores al evento que origine la reclamación.
                                DocFlow no será responsable de daños indirectos, pérdida de beneficios, pérdida
                                de datos ni daños consecuentes.
                            </p>
                        </div>
                    </section>

                    {/* 8 */}
                    <section id="legislacion">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">8. Legislación aplicable</h2>
                        <p className="text-sm">
                            Estos Términos de uso se rigen por la legislación española. Para la resolución de
                            cualquier controversia derivada del acceso o uso de DocFlow, las partes se someten
                            a la jurisdicción de los Juzgados y Tribunales de <strong>Barcelona</strong>, con
                            renuncia expresa a cualquier otro fuero que pudiera corresponderles, salvo que la
                            normativa aplicable establezca un fuero imperativo diferente para los consumidores.
                        </p>
                    </section>

                    {/* 9 */}
                    <section id="contacto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">9. Contacto</h2>
                        <p className="text-sm">
                            Para cualquier consulta sobre estos Términos de uso, puedes contactar con nosotros en{' '}
                            <a href="mailto:legal@docflow.es" className="text-indigo-600 hover:underline">
                                legal@docflow.es
                            </a>.
                        </p>
                    </section>

                </div>
            </div>

            <LegalFooter />
        </div>
    );
}
