import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

const BASE_URL = 'https://api.docflow.es/v1';

const SECTIONS = [
    { id: 'intro',       label: 'Introducción' },
    { id: 'auth',        label: 'Autenticación' },
    { id: 'documents',   label: 'Documentos' },
    { id: 'signers',     label: 'Firmantes' },
    { id: 'send',        label: 'Envío y descarga' },
    { id: 'templates',   label: 'Plantillas' },
    { id: 'me',          label: 'Mi cuenta' },
    { id: 'errors',      label: 'Errores' },
    { id: 'limits',      label: 'Límites de uso' },
];

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={copy} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
            {copied ? <><CheckIcon className="w-3.5 h-3.5" />Copiado</> : <><ClipboardDocumentIcon className="w-3.5 h-3.5" />Copiar</>}
        </button>
    );
}

function Code({ children, lang = 'bash' }) {
    return (
        <div className="rounded-xl bg-gray-900 overflow-hidden my-4 text-sm">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                <span className="text-xs text-gray-400 font-mono">{lang}</span>
                <CopyButton text={children} />
            </div>
            <pre className="px-4 py-3 text-gray-100 font-mono overflow-x-auto whitespace-pre">{children}</pre>
        </div>
    );
}

function Method({ method }) {
    const colors = { GET: 'bg-green-100 text-green-800', POST: 'bg-blue-100 text-blue-800', DELETE: 'bg-red-100 text-red-700', PUT: 'bg-amber-100 text-amber-800' };
    return <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold font-mono ${colors[method] ?? 'bg-gray-100 text-gray-700'}`}>{method}</span>;
}

function Endpoint({ method, path, description, params, request, response }) {
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <Method method={method} />
                <code className="text-sm font-mono text-gray-800">{BASE_URL}{path}</code>
            </div>
            <div className="p-4 space-y-4">
                {description && <p className="text-sm text-gray-600">{description}</p>}
                {params && (
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Parámetros</p>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-1.5 pr-4 text-xs font-semibold text-gray-500">Nombre</th>
                                    <th className="text-left py-1.5 pr-4 text-xs font-semibold text-gray-500">Tipo</th>
                                    <th className="text-left py-1.5 text-xs font-semibold text-gray-500">Descripción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {params.map((p) => (
                                    <tr key={p.name} className="border-b border-gray-50">
                                        <td className="py-1.5 pr-4 font-mono text-xs text-indigo-700">{p.name}</td>
                                        <td className="py-1.5 pr-4 text-xs text-gray-500">{p.type}</td>
                                        <td className="py-1.5 text-xs text-gray-600">{p.desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {request && (
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ejemplo de petición</p>
                        <Code lang="bash">{request}</Code>
                    </div>
                )}
                {response && (
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ejemplo de respuesta</p>
                        <Code lang="json">{response}</Code>
                    </div>
                )}
            </div>
        </div>
    );
}

function Section({ id, title, children }) {
    return (
        <section id={id} className="mb-14 scroll-mt-24">
            <h2 className="text-xl font-bold text-gray-900 mb-5 pb-2 border-b border-gray-200">{title}</h2>
            {children}
        </section>
    );
}

export default function Docs() {
    const [active, setActive] = useState('intro');

    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
            },
            { rootMargin: '-20% 0px -70% 0px' }
        );
        SECTIONS.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) obs.observe(el);
        });
        return () => obs.disconnect();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
                    <Link to="/" className="font-display text-xl font-bold text-indigo-600">DocFlow</Link>
                    <div className="flex items-center gap-4">
                        <Link to="/settings/developer" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                            Mis API Keys
                        </Link>
                        <Link to="/dashboard" className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                            Volver a la app →
                        </Link>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-5 py-10 flex gap-10">
                {/* Sidebar */}
                <aside className="w-52 shrink-0 hidden lg:block">
                    <div className="sticky top-24">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Contenido</p>
                        <nav className="space-y-0.5">
                            {SECTIONS.map(({ id, label }) => (
                                <a
                                    key={id}
                                    href={`#${id}`}
                                    className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                        active === id
                                            ? 'bg-indigo-50 text-indigo-700 font-medium'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    {label}
                                </a>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main */}
                <main className="flex-1 min-w-0">
                    <Section id="intro" title="Introducción">
                        <p className="text-gray-600 mb-4">
                            La API de DocFlow permite gestionar documentos, firmantes y plantillas desde tus propias aplicaciones.
                        </p>
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
                            <p className="text-sm font-semibold text-indigo-900 mb-1">URL base</p>
                            <code className="text-sm font-mono text-indigo-700">{BASE_URL}</code>
                        </div>
                        <p className="text-sm text-gray-600">
                            Todas las respuestas son JSON. Los listados incluyen un objeto <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">meta</code> con paginación.
                            Los errores devuelven un objeto <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">error</code> con código y mensaje.
                        </p>
                        <Code lang="json">{`// Respuesta de listado
{
  "object": "list",
  "data": [...],
  "meta": { "total": 10, "page": 1, "per_page": 15 }
}

// Respuesta de error
{
  "error": {
    "code": "not_found",
    "message": "El documento no existe.",
    "status": 404
  }
}`}</Code>
                    </Section>

                    <Section id="auth" title="Autenticación">
                        <p className="text-sm text-gray-600 mb-4">
                            Todas las peticiones requieren una API Key en el header <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">Authorization</code>.
                            Puedes crear tus keys en <Link to="/settings/developer" className="text-indigo-600 hover:underline">/settings/developer</Link>.
                        </p>
                        <Code lang="http">{`Authorization: Bearer df_live_tu_api_key_aqui

# Alternativa
X-API-Key: df_live_tu_api_key_aqui`}</Code>
                        <Code lang="bash">{`curl https://api.docflow.es/v1/me \\
     -H "Authorization: Bearer df_live_abc123..."`}</Code>
                    </Section>

                    <Section id="documents" title="Documentos">
                        <Endpoint
                            method="GET"
                            path="/documents"
                            description="Lista todos los documentos del tenant, ordenados por fecha de creación descendente."
                            params={[
                                { name: 'status',       type: 'string',  desc: 'Filtrar por estado: draft, sent, completed, expired' },
                                { name: 'search',       type: 'string',  desc: 'Buscar por título o nombre de archivo' },
                                { name: 'per_page',     type: 'integer', desc: 'Resultados por página (máx. 100, defecto 15)' },
                                { name: 'signer_email', type: 'string',  desc: 'Filtrar por email de firmante' },
                            ]}
                            request={`curl "${BASE_URL}/documents?status=sent&per_page=20" \\
     -H "Authorization: Bearer df_live_..."`}
                            response={`{
  "object": "list",
  "data": [
    {
      "id": 42,
      "title": "Contrato de servicios",
      "status": "sent",
      "original_filename": "contrato.pdf",
      "created_at": "2026-04-29T10:00:00+00:00",
      "signers_count": 2,
      "signers_signed_count": 1
    }
  ],
  "meta": { "total": 1, "page": 1, "per_page": 20 }
}`}
                        />
                        <Endpoint
                            method="POST"
                            path="/documents"
                            description="Sube un PDF y crea un nuevo documento en estado draft."
                            params={[
                                { name: 'title',      type: 'string (required)',  desc: 'Nombre del documento' },
                                { name: 'file',       type: 'file PDF (required)', desc: 'Archivo PDF, máx. 20 MB' },
                                { name: 'expires_at', type: 'date (opcional)',     desc: 'Fecha de expiración (YYYY-MM-DD)' },
                            ]}
                            request={`curl -X POST "${BASE_URL}/documents" \\
     -H "Authorization: Bearer df_live_..." \\
     -F "title=Mi contrato" \\
     -F "file=@/ruta/contrato.pdf"`}
                            response={`{
  "object": "document",
  "data": {
    "id": 43,
    "title": "Mi contrato",
    "status": "draft",
    "original_filename": "contrato.pdf",
    "created_at": "2026-04-29T10:05:00+00:00"
  }
}`}
                        />
                        <Endpoint
                            method="GET"
                            path="/documents/{id}"
                            description="Obtiene un documento con sus firmantes y eventos."
                            request={`curl "${BASE_URL}/documents/43" \\
     -H "Authorization: Bearer df_live_..."`}
                            response={`{
  "object": "document",
  "data": {
    "id": 43,
    "title": "Mi contrato",
    "status": "draft",
    "signers": [
      { "id": 1, "name": "Ana García", "email": "ana@empresa.com", "status": "pending", "order": 1 }
    ]
  }
}`}
                        />
                        <Endpoint
                            method="DELETE"
                            path="/documents/{id}"
                            description="Elimina un documento. Solo se pueden eliminar documentos en estado draft."
                            request={`curl -X DELETE "${BASE_URL}/documents/43" \\
     -H "Authorization: Bearer df_live_..."`}
                            response={`{ "object": "deleted", "data": { "id": 43, "deleted": true } }`}
                        />
                    </Section>

                    <Section id="signers" title="Firmantes">
                        <Endpoint
                            method="POST"
                            path="/documents/{id}/signers"
                            description="Añade un firmante al documento. Solo se puede hacer mientras está en estado draft."
                            params={[
                                { name: 'name',  type: 'string (required)',  desc: 'Nombre del firmante' },
                                { name: 'email', type: 'string (required)',  desc: 'Email del firmante' },
                                { name: 'order', type: 'integer (required)', desc: 'Orden de firma (1, 2, 3…)' },
                            ]}
                            request={`curl -X POST "${BASE_URL}/documents/43/signers" \\
     -H "Authorization: Bearer df_live_..." \\
     -H "Content-Type: application/json" \\
     -d '{"name":"Ana García","email":"ana@empresa.com","order":1}'`}
                            response={`{
  "object": "signer",
  "data": { "id": 1, "name": "Ana García", "email": "ana@empresa.com", "order": 1, "status": "pending" }
}`}
                        />
                        <Endpoint
                            method="DELETE"
                            path="/documents/{id}/signers/{signerId}"
                            description="Elimina un firmante del documento (solo mientras está en draft)."
                            request={`curl -X DELETE "${BASE_URL}/documents/43/signers/1" \\
     -H "Authorization: Bearer df_live_..."`}
                            response={`{ "object": "deleted", "data": { "id": 1, "deleted": true } }`}
                        />
                    </Section>

                    <Section id="send" title="Envío y descarga">
                        <Endpoint
                            method="POST"
                            path="/documents/{id}/send"
                            description="Envía el documento a todos los firmantes por email. El documento pasa a estado sent."
                            request={`curl -X POST "${BASE_URL}/documents/43/send" \\
     -H "Authorization: Bearer df_live_..."`}
                            response={`{ "object": "document", "data": { "id": 43, "status": "sent" } }`}
                        />
                        <Endpoint
                            method="GET"
                            path="/documents/{id}/download"
                            description="Devuelve una URL temporal (24h) para descargar el PDF firmado. Solo disponible cuando el documento está completado."
                            request={`curl "${BASE_URL}/documents/43/download" \\
     -H "Authorization: Bearer df_live_..."`}
                            response={`{ "object": "download", "data": { "download_url": "https://..." } }`}
                        />
                        <Endpoint
                            method="GET"
                            path="/documents/{id}/download-original"
                            description="Devuelve una URL temporal (1h) para descargar el PDF original."
                            request={`curl "${BASE_URL}/documents/43/download-original" \\
     -H "Authorization: Bearer df_live_..."`}
                            response={`{ "object": "download", "data": { "download_url": "https://..." } }`}
                        />
                    </Section>

                    <Section id="templates" title="Plantillas">
                        <Endpoint
                            method="GET"
                            path="/templates"
                            description="Lista todas las plantillas del tenant más las plantillas del sistema."
                            request={`curl "${BASE_URL}/templates" \\
     -H "Authorization: Bearer df_live_..."`}
                            response={`{
  "object": "list",
  "data": [
    { "id": 1, "name": "Contrato NDA", "is_system": false, "variables": ["empresa", "fecha"] },
    { "id": 2, "name": "Acuerdo de confidencialidad", "is_system": true }
  ],
  "meta": { "total": 2 }
}`}
                        />
                    </Section>

                    <Section id="me" title="Información de cuenta">
                        <Endpoint
                            method="GET"
                            path="/me"
                            description="Devuelve información sobre el tenant, plan activo y uso actual."
                            request={`curl "${BASE_URL}/me" \\
     -H "Authorization: Bearer df_live_..."`}
                            response={`{
  "object": "tenant",
  "data": {
    "tenant": { "id": 1, "name": "Empresa S.L.", "plan": "pro" },
    "usage":  { "documents_this_month": 12, "templates_count": 3 },
    "limits": { "documents_per_month": 50, "signers_per_document": 10, "templates": 20 }
  }
}`}
                        />
                    </Section>

                    <Section id="errors" title="Errores">
                        <p className="text-sm text-gray-600 mb-4">
                            Todos los errores tienen el mismo formato con un código identificador.
                        </p>
                        <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">HTTP</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Código</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Significado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[
                                    [401, 'unauthorized',       'API key inválida, revocada o expirada'],
                                    [403, 'forbidden',          'Sin permisos para realizar esta acción'],
                                    [404, 'not_found',          'El recurso no existe'],
                                    [422, 'validation_error',   'Parámetros inválidos o faltantes'],
                                    [422, 'plan_limit_exceeded','Límite del plan alcanzado'],
                                    [429, 'rate_limit_exceeded','Más de 100 peticiones por minuto'],
                                    [500, 'internal_error',     'Error interno del servidor'],
                                ].map(([status, code, desc]) => (
                                    <tr key={code} className="hover:bg-gray-50">
                                        <td className="px-4 py-2.5 font-mono text-sm text-gray-700">{status}</td>
                                        <td className="px-4 py-2.5 font-mono text-xs text-indigo-700">{code}</td>
                                        <td className="px-4 py-2.5 text-sm text-gray-600">{desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Section>

                    <Section id="limits" title="Límites de uso">
                        <div className="space-y-4 text-sm text-gray-600">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <p className="font-semibold text-amber-900 mb-1">Rate limiting</p>
                                <p>Máximo <strong>100 peticiones por minuto</strong> por API key. Los headers <code className="font-mono text-xs bg-amber-100 px-1 rounded">X-RateLimit-Limit</code>, <code className="font-mono text-xs bg-amber-100 px-1 rounded">X-RateLimit-Remaining</code> y <code className="font-mono text-xs bg-amber-100 px-1 rounded">X-RateLimit-Reset</code> se incluyen en cada respuesta.</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-700 mb-2">Límites por plan</p>
                                <table className="w-full border border-gray-200 rounded-xl overflow-hidden">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Plan</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Docs/mes</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Firmantes/doc</th>
                                            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Plantillas</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {[
                                            ['Free', '5', '2', '3'],
                                            ['Pro', '50', '10', '20'],
                                            ['Business', '∞', '∞', '∞'],
                                        ].map(([plan, docs, signers, templates]) => (
                                            <tr key={plan}>
                                                <td className="px-4 py-2.5 font-medium text-gray-800">{plan}</td>
                                                <td className="px-4 py-2.5 text-gray-600">{docs}</td>
                                                <td className="px-4 py-2.5 text-gray-600">{signers}</td>
                                                <td className="px-4 py-2.5 text-gray-600">{templates}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p>
                                Consulta tu uso actual con el endpoint <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">GET /v1/me</code>.
                            </p>
                        </div>
                    </Section>
                </main>
            </div>
        </div>
    );
}
