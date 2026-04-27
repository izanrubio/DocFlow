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
    { id: 'responsable',      label: '1. Responsable del tratamiento' },
    { id: 'datos',            label: '2. Datos que recopilamos' },
    { id: 'finalidad',        label: '3. Finalidad del tratamiento' },
    { id: 'base-juridica',    label: '4. Base jurídica' },
    { id: 'conservacion',     label: '5. Conservación de datos' },
    { id: 'derechos',         label: '6. Derechos del usuario' },
    { id: 'transferencias',   label: '7. Transferencias internacionales' },
    { id: 'cookies',          label: '8. Cookies' },
    { id: 'cambios',          label: '9. Cambios en la política' },
];

export default function PrivacyPolicy() {
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
                    <span className="text-gray-700 font-medium">Política de privacidad</span>
                </nav>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de privacidad</h1>
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
                        En DocFlow nos tomamos muy en serio la privacidad de nuestros usuarios. Esta política describe cómo
                        recopilamos, usamos y protegemos tus datos personales de acuerdo con el Reglamento (UE) 2016/679
                        (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos
                        digitales (LOPDGDD).
                    </p>

                    {/* 1 */}
                    <section id="responsable">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">1. Responsable del tratamiento</h2>
                        <p className="text-sm mb-3">
                            El responsable del tratamiento de tus datos personales es:
                        </p>
                        <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                            <p><strong>Denominación:</strong> DocFlow</p>
                            <p><strong>Actividad:</strong> Servicio de firma electrónica de documentos</p>
                            <p><strong>Email de contacto:</strong>{' '}
                                <a href="mailto:privacy@docflow.es" className="text-indigo-600 hover:underline">
                                    privacy@docflow.es
                                </a>
                            </p>
                        </div>
                    </section>

                    {/* 2 */}
                    <section id="datos">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">2. Datos que recopilamos</h2>
                        <div className="space-y-4 text-sm">
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">Datos de registro</h3>
                                <p>Al crear una cuenta recopilamos tu nombre completo o nombre de empresa y dirección
                                de correo electrónico.</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">Datos de uso del servicio</h3>
                                <p>Los documentos que subes para firma, los datos de los firmantes (nombre y email)
                                que introduces, y los eventos asociados al ciclo de vida de cada documento
                                (envío, firma, expiración, cancelación).</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">Datos técnicos de firma</h3>
                                <p>Cuando un firmante accede al enlace de firma, registramos su dirección IP y el
                                user agent del navegador. Estos datos forman parte del registro de auditoría
                                de la firma electrónica y tienen valor probatorio.</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">Datos de facturación</h3>
                                <p>El pago se gestiona íntegramente a través de Stripe. DocFlow no almacena
                                datos de tarjeta de crédito. Únicamente conservamos el identificador de cliente
                                Stripe y la información de suscripción activa (plan, estado, fecha de renovación).</p>
                            </div>
                        </div>
                    </section>

                    {/* 3 */}
                    <section id="finalidad">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">3. Finalidad del tratamiento</h2>
                        <ul className="text-sm space-y-2 list-disc list-inside">
                            <li><strong>Prestación del servicio:</strong> gestionar tu cuenta y permitirte enviar,
                            firmar y archivar documentos electrónicamente.</li>
                            <li><strong>Gestión de suscripciones y facturación:</strong> procesar pagos, emitir
                            facturas y controlar los límites de uso según tu plan.</li>
                            <li><strong>Comunicaciones del servicio:</strong> enviarte los enlaces de firma,
                            recordatorios de documentos pendientes y notificaciones sobre el estado de tus
                            documentos. No enviamos publicidad sin tu consentimiento explícito.</li>
                            <li><strong>Seguridad y prevención de fraude:</strong> detectar usos abusivos,
                            proteger la integridad del servicio y mantener registros de auditoría.</li>
                        </ul>
                    </section>

                    {/* 4 */}
                    <section id="base-juridica">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">4. Base jurídica</h2>
                        <div className="text-sm space-y-3">
                            <p>
                                <strong>Ejecución de un contrato (art. 6.1.b RGPD):</strong> el tratamiento es
                                necesario para la prestación del servicio que contratas al registrarte y aceptar
                                los Términos de uso. Sin estos datos no podemos ofrecerte el servicio.
                            </p>
                            <p>
                                <strong>Interés legítimo (art. 6.1.f RGPD):</strong> el registro de IPs y user
                                agents durante el proceso de firma responde a nuestro interés legítimo en
                                garantizar la seguridad del servicio y proporcionar evidencias de auditoría que
                                puedan tener valor probatorio en caso de disputa.
                            </p>
                            <p>
                                <strong>Obligación legal (art. 6.1.c RGPD):</strong> la conservación de
                                documentos firmados durante 5 años responde a las obligaciones legales
                                aplicables en materia mercantil y fiscal.
                            </p>
                        </div>
                    </section>

                    {/* 5 */}
                    <section id="conservacion">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">5. Conservación de datos</h2>
                        <div className="text-sm space-y-3">
                            <p>
                                <strong>Documentos firmados:</strong> se conservan durante <strong>5 años</strong> desde
                                la fecha de la firma, en cumplimiento de las obligaciones legales en materia
                                mercantil (art. 30 Código de Comercio).
                            </p>
                            <p>
                                <strong>Datos de cuenta:</strong> se conservan mientras dure la relación contractual.
                                Cuando cancelas tu cuenta, tus datos se anonimizarán o eliminarán en un plazo
                                máximo de 30 días, salvo los documentos que estén sujetos al plazo de conservación
                                legal indicado.
                            </p>
                            <p>
                                <strong>Datos de facturación:</strong> conservados durante el período exigido por la
                                normativa fiscal española (4 años).
                            </p>
                        </div>
                    </section>

                    {/* 6 */}
                    <section id="derechos">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">6. Derechos del usuario</h2>
                        <p className="text-sm mb-3">
                            En virtud del RGPD tienes los siguientes derechos respecto a tus datos personales:
                        </p>
                        <ul className="text-sm space-y-2 list-disc list-inside mb-4">
                            <li><strong>Acceso:</strong> obtener confirmación de si tratamos tus datos y acceder a ellos.</li>
                            <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
                            <li><strong>Supresión:</strong> solicitar la eliminación de tus datos cuando ya no sean
                            necesarios para los fines para los que fueron recogidos.</li>
                            <li><strong>Portabilidad:</strong> recibir tus datos en un formato estructurado y
                            legible por máquina.</li>
                            <li><strong>Oposición y limitación:</strong> oponerte al tratamiento o solicitar
                            que se limite en determinadas circunstancias.</li>
                        </ul>
                        <p className="text-sm">
                            Para ejercer cualquiera de estos derechos, escríbenos a{' '}
                            <a href="mailto:privacy@docflow.es" className="text-indigo-600 hover:underline">
                                privacy@docflow.es
                            </a>.
                            Responderemos en el plazo máximo de un mes. También tienes derecho a presentar una
                            reclamación ante la{' '}
                            <a
                                href="https://www.aepd.es"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:underline"
                            >
                                Agencia Española de Protección de Datos (AEPD)
                            </a>.
                        </p>
                    </section>

                    {/* 7 */}
                    <section id="transferencias">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">7. Transferencias internacionales</h2>
                        <div className="text-sm space-y-3">
                            <p>
                                <strong>Stripe (EE. UU.):</strong> utilizamos Stripe para el procesamiento de pagos.
                                Stripe está acogido a las Cláusulas Contractuales Tipo aprobadas por la Comisión
                                Europea, que garantizan un nivel de protección adecuado. Puedes consultar su política
                                de privacidad en{' '}
                                <a
                                    href="https://stripe.com/es/privacy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:underline"
                                >
                                    stripe.com/es/privacy
                                </a>.
                            </p>
                            <p>
                                <strong>Infraestructura:</strong> todos los demás datos (documentos, cuentas,
                                registros de firma) se almacenan en servidores ubicados en la Unión Europea,
                                por lo que no están sujetos a transferencias internacionales.
                            </p>
                        </div>
                    </section>

                    {/* 8 */}
                    <section id="cookies">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">8. Cookies</h2>
                        <p className="text-sm">
                            DocFlow utiliza únicamente cookies técnicas estrictamente necesarias para el
                            funcionamiento del servicio (autenticación de sesión, preferencias de interfaz).
                            No utilizamos cookies de seguimiento, publicidad ni análisis de terceros.
                            Al ser cookies técnicas necesarias no requieren tu consentimiento previo según
                            el art. 22.2 de la LSSI.
                        </p>
                    </section>

                    {/* 9 */}
                    <section id="cambios">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">9. Cambios en la política</h2>
                        <p className="text-sm">
                            Podemos actualizar esta política cuando sea necesario. Ante cambios sustanciales
                            que afecten a tus derechos te lo notificaremos por email con al menos 15 días de
                            antelación. La fecha de última actualización aparece al inicio de este documento.
                            El uso continuado del servicio tras la entrada en vigor de los cambios implica
                            su aceptación.
                        </p>
                    </section>

                </div>
            </div>

            <LegalFooter />
        </div>
    );
}
