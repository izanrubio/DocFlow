import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    PlusIcon,
    KeyIcon,
    ClipboardDocumentIcon,
    TrashIcon,
    CheckIcon,
    ArrowTopRightOnSquareIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import ConfirmModal from '../../components/ConfirmModal';
import { getApiKeys, createApiKey, revokeApiKey } from '../../api/developer';
import { useToast } from '../../context/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';

// ── Copy button ────────────────────────────────────────────────────────────

function CopyButton({ text, className = '' }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={copy}
            title="Copiar"
            className={`p-1 rounded transition-colors ${copied ? 'text-green-600' : 'text-gray-400 hover:text-gray-700'} ${className}`}
        >
            {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
        </button>
    );
}

// ── Create key modal ────────────────────────────────────────────────────────

function CreateKeyModal({ onClose, onCreate }) {
    const [name, setName]     = useState('');
    const [expiry, setExpiry] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const submit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        try {
            const payload = { name: name.trim() };
            if (expiry) payload.expires_at = expiry;
            const res = await createApiKey(payload);
            onCreate(res.data.data);
        } catch {
            toast.error('No se pudo crear la API key.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Nueva API Key</h2>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            autoFocus
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Mi CRM, App móvil…"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha de expiración <span className="text-gray-400 font-normal">(opcional)</span>
                        </label>
                        <input
                            type="date"
                            value={expiry}
                            min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
                            onChange={(e) => setExpiry(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || loading}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creando…' : 'Crear key'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Key reveal modal ────────────────────────────────────────────────────────

function KeyRevealModal({ apiKey, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
                <div className="flex items-start gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Guarda esta clave ahora</h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            No podrás volver a verla completa. Cópiala en un lugar seguro antes de cerrar.
                        </p>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                    <p className="text-xs text-amber-700 font-medium mb-2">API Key — {apiKey.name}</p>
                    <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-2">
                        <code className="flex-1 text-sm text-gray-800 font-mono break-all">{apiKey.key}</code>
                        <CopyButton text={apiKey.key} />
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    He guardado la clave
                </button>
            </div>
        </div>
    );
}

// ── Code block ──────────────────────────────────────────────────────────────

function CodeBlock({ children, language = 'bash' }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        await navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="relative group rounded-xl bg-gray-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                <span className="text-xs text-gray-400 font-mono">{language}</span>
                <button
                    onClick={copy}
                    className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                    {copied ? <><CheckIcon className="w-3 h-3" /> Copiado</> : <><ClipboardDocumentIcon className="w-3 h-3" /> Copiar</>}
                </button>
            </div>
            <pre className="px-4 py-3 text-sm text-gray-100 font-mono overflow-x-auto whitespace-pre-wrap">
                {children}
            </pre>
        </div>
    );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function Developer() {
    const { isAdmin }    = usePermissions();
    const queryClient    = useQueryClient();
    const toast          = useToast();
    const [showCreate, setShowCreate]         = useState(false);
    const [revealKey, setRevealKey]           = useState(null);
    const [revokeTarget, setRevokeTarget]     = useState(null);

    const { data: keys = [], isLoading } = useQuery({
        queryKey: ['api-keys'],
        queryFn:  () => getApiKeys().then((r) => r.data.data),
        enabled:  isAdmin,
    });

    const revokeMutation = useMutation({
        mutationFn: (id) => revokeApiKey(id),
        onSuccess:  () => {
            queryClient.invalidateQueries({ queryKey: ['api-keys'] });
            toast.success('API key revocada.');
        },
        onError: () => toast.error('No se pudo revocar la API key.'),
    });

    const handleCreated = (key) => {
        queryClient.invalidateQueries({ queryKey: ['api-keys'] });
        setShowCreate(false);
        setRevealKey(key);
    };

    if (!isAdmin) {
        return (
            <Layout>
                <div className="text-center py-20">
                    <p className="text-gray-500">Solo los administradores pueden gestionar las API keys.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">API & Desarrolladores</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Integra DocFlow en tus aplicaciones usando la API pública.
                        </p>
                    </div>
                    <Link
                        to="/docs"
                        className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        Ver documentación completa
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    </Link>
                </div>

                {/* API Keys section */}
                <section className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">API Keys</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Usa estas claves para autenticar peticiones a la API.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Crear API Key
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
                        </div>
                    ) : keys.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                            <KeyIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No hay API keys todavía</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {keys.map((k) => (
                                <div key={k.id} className="py-4 flex items-center gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-sm font-medium text-gray-900">{k.name}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${k.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                {k.is_active ? 'Activa' : 'Revocada'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <code className="text-xs text-gray-500 font-mono">{k.key}</code>
                                            <CopyButton text={k.key} />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Último uso: {k.last_used_at ? new Date(k.last_used_at).toLocaleString('es-ES') : 'Nunca'}
                                            {k.expires_at && (
                                                <> · Expira: {new Date(k.expires_at).toLocaleDateString('es-ES')}</>
                                            )}
                                        </p>
                                    </div>
                                    {k.is_active && (
                                        <button
                                            onClick={() => setRevokeTarget(k)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Revocar"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Quick docs section */}
                <section className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-5">Documentación rápida</h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Autenticación</h3>
                            <CodeBlock language="http">{'Authorization: Bearer df_live_tu_api_key'}</CodeBlock>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Listar documentos</h3>
                            <CodeBlock language="bash">{`curl -H "Authorization: Bearer df_live_..." \\
     https://api.docflow.es/v1/documents`}</CodeBlock>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Crear y enviar un documento</h3>
                            <CodeBlock language="bash">{`# 1. Subir el PDF
curl -X POST https://api.docflow.es/v1/documents \\
     -H "Authorization: Bearer df_live_..." \\
     -F "title=Mi contrato" \\
     -F "file=@/ruta/al/archivo.pdf"

# 2. Añadir firmantes
curl -X POST https://api.docflow.es/v1/documents/{id}/signers \\
     -H "Authorization: Bearer df_live_..." \\
     -H "Content-Type: application/json" \\
     -d '{"name":"Ana García","email":"ana@empresa.com","order":1}'

# 3. Enviar para firma
curl -X POST https://api.docflow.es/v1/documents/{id}/send \\
     -H "Authorization: Bearer df_live_..."`}</CodeBlock>
                        </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-gray-100">
                        <Link
                            to="/docs"
                            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Ver documentación completa →
                        </Link>
                    </div>
                </section>
            </div>

            {/* Modals */}
            {showCreate && (
                <CreateKeyModal
                    onClose={() => setShowCreate(false)}
                    onCreate={handleCreated}
                />
            )}
            {revealKey && (
                <KeyRevealModal
                    apiKey={revealKey}
                    onClose={() => setRevealKey(null)}
                />
            )}
            <ConfirmModal
                open={!!revokeTarget}
                title="Revocar API Key"
                message={revokeTarget ? `¿Revocar la key «${revokeTarget.name}»? Las integraciones que la usen dejarán de funcionar.` : ''}
                confirmLabel="Revocar"
                loading={revokeMutation.isPending}
                onConfirm={() => { const id = revokeTarget.id; setRevokeTarget(null); revokeMutation.mutate(id); }}
                onCancel={() => setRevokeTarget(null)}
            />
        </Layout>
    );
}
