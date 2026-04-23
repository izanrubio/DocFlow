import { useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Document, Page, pdfjs } from 'react-pdf';
import {
    ArrowLeftIcon,
    ArrowDownTrayIcon,
    BellIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    DocumentIcon,
    EnvelopeIcon,
    ExclamationTriangleIcon,
    TrashIcon,
    UserPlusIcon,
    CheckCircleIcon,
    ClockIcon,
    EyeIcon,
    XCircleIcon,
    XMarkIcon,
    PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import Layout from '../components/Layout';
import { getDocument, deleteDocument, addSigner, removeSigner, sendDocument, downloadDocument } from '../api/documents';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const STATUS_BADGE = {
    draft:       'bg-gray-100 text-gray-700',
    sent:        'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed:   'bg-green-100 text-green-700',
    expired:     'bg-red-100 text-red-700',
    cancelled:   'bg-gray-200 text-gray-600',
};
const STATUS_LABEL = {
    draft: 'Borrador', sent: 'Enviado', in_progress: 'En proceso',
    completed: 'Completado', expired: 'Expirado', cancelled: 'Cancelado',
};
const SIGNER_BADGE = {
    pending:  'bg-gray-100 text-gray-600',
    viewed:   'bg-blue-100 text-blue-700',
    signed:   'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};
const SIGNER_LABEL = {
    pending: 'Pendiente', viewed: 'Ha visto el documento',
    signed: 'Firmado', rejected: 'Rechazado',
};
const SIGNER_ICON = {
    pending:  <ClockIcon className="w-4 h-4 text-gray-400" />,
    viewed:   <EyeIcon className="w-4 h-4 text-blue-500" />,
    signed:   <CheckCircleIcon className="w-4 h-4 text-green-500" />,
    rejected: <XCircleIcon className="w-4 h-4 text-red-500" />,
};
const EVENT_LABEL = {
    created:       'Documento creado',
    sent:          'Enviado a firmantes',
    viewed:        'Visualizado',
    signed:        'Firmado',
    rejected:      'Rechazado',
    completed:     'Completado',
    expired:       'Caducado',
    reminder_sent: 'Recordatorio enviado',
};
const EVENT_ICON = {
    created:       <DocumentIcon className="w-3.5 h-3.5 text-gray-400" />,
    sent:          <EnvelopeIcon className="w-3.5 h-3.5 text-blue-400" />,
    viewed:        <EyeIcon className="w-3.5 h-3.5 text-blue-400" />,
    signed:        <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />,
    rejected:      <XCircleIcon className="w-3.5 h-3.5 text-red-500" />,
    completed:     <CheckCircleSolid className="w-3.5 h-3.5 text-green-600" />,
    expired:       <ClockIcon className="w-3.5 h-3.5 text-red-500" />,
    reminder_sent: <BellIcon className="w-3.5 h-3.5 text-yellow-500" />,
};

const EMPTY_SIGNER = { name: '', email: '', order: 1 };

function DownloadButton({ documentId }) {
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    const handleClick = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await downloadDocument(documentId);
            window.open(res.data.data.download_url, '_blank');
        } catch (e) {
            setError(e?.response?.data?.message ?? 'Error al obtener el enlace de descarga.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-1.5">
            <button
                onClick={handleClick}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
                <ArrowDownTrayIcon className="w-4 h-4" />
                {loading ? 'Generando enlace…' : 'Descargar PDF firmado'}
            </button>
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </div>
    );
}

export default function DocumentDetail() {
    const { id }           = useParams();
    const navigate         = useNavigate();
    const { state }        = useLocation();
    const queryClient      = useQueryClient();
    const successMessage   = state?.successMessage ?? null;

    const [numPages, setNumPages]     = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [showAddForm, setShowAddForm] = useState(false);
    const [signerForm, setSignerForm]   = useState(EMPTY_SIGNER);
    const [signerErrors, setSignerErrors] = useState({});

    const { data, isLoading, isError } = useQuery({
        queryKey: ['document', id],
        queryFn:  () => getDocument(id).then((r) => r.data.data),
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            return status === 'sent' || status === 'in_progress' ? 10000 : false;
        },
    });

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['document', id] });

    const deleteMutation = useMutation({
        mutationFn: () => deleteDocument(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            navigate('/dashboard');
        },
    });

    const addSignerMutation = useMutation({
        mutationFn: (data) => addSigner(id, data),
        onSuccess: () => {
            invalidate();
            setShowAddForm(false);
            setSignerForm(EMPTY_SIGNER);
            setSignerErrors({});
        },
        onError: (err) => {
            if (err.response?.status === 422) setSignerErrors(err.response.data.errors ?? {});
        },
    });

    const removeSignerMutation = useMutation({
        mutationFn: (signerId) => removeSigner(id, signerId),
        onSuccess: invalidate,
    });

    const sendMutation = useMutation({
        mutationFn: () => sendDocument(id),
        onSuccess: () => {
            invalidate();
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });

    const onDocumentLoadSuccess = useCallback(({ numPages: n }) => {
        setNumPages(n);
        setPageNumber(1);
    }, []);

    const handleDelete = () => {
        if (window.confirm('¿Eliminar este documento? Esta acción no se puede deshacer.')) {
            deleteMutation.mutate();
        }
    };

    const handleSend = () => {
        if (window.confirm('¿Estás seguro? Una vez enviado no podrás modificar los firmantes.')) {
            sendMutation.mutate();
        }
    };

    const handleAddSigner = (e) => {
        e.preventDefault();
        setSignerErrors({});
        addSignerMutation.mutate(signerForm);
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                    <div className="flex gap-6 mt-4">
                        <div className="flex-1 h-96 bg-gray-200 rounded-xl" />
                        <div className="w-80 space-y-3">
                            {[...Array(4)].map((_, i) => <div key={i} className="h-6 bg-gray-200 rounded" />)}
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (isError || !data) {
        return <Layout><p className="text-red-600">No se pudo cargar el documento.</p></Layout>;
    }

    const doc = data;
    const isDraft     = doc.status === 'draft';
    const isCompleted = doc.status === 'completed';
    const isExpired   = doc.status === 'expired';
    const hasSigner   = doc.signers && doc.signers.length > 0;

    const expiryColor = () => {
        if (!doc.expires_at || isExpired) return null;
        const daysLeft = (new Date(doc.expires_at) - Date.now()) / 86400000;
        if (daysLeft < 2)  return 'text-red-600 font-semibold';
        if (daysLeft < 7)  return 'text-yellow-600';
        return 'text-green-700';
    };

    return (
        <Layout>
            {successMessage && (
                <div className="mb-4 flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-3">
                    <CheckCircleIcon className="w-5 h-5 text-indigo-500 shrink-0" />
                    <p className="text-sm font-medium text-indigo-800">{successMessage}</p>
                </div>
            )}

            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-gray-900 truncate">{doc.title}</h1>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[doc.status]}`}>
                    {STATUS_LABEL[doc.status] ?? doc.status}
                </span>
            </div>

            {isCompleted && (
                <div className="mb-6 flex items-center justify-between gap-4 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
                    <div className="flex items-center gap-3">
                        <CheckCircleIcon className="w-6 h-6 text-green-500 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-green-800">Documento firmado por todos los firmantes</p>
                            <p className="text-xs text-green-600">El PDF sellado está disponible para su descarga.</p>
                        </div>
                    </div>
                    {doc.has_signed_file && (
                        <button
                            onClick={async () => {
                                const res = await downloadDocument(id);
                                window.open(res.data.data.download_url, '_blank');
                            }}
                            className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            Descargar PDF firmado
                        </button>
                    )}
                </div>
            )}

            {isExpired && (
                <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-500 shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-red-800">Este documento ha caducado y ya no puede ser firmado</p>
                        <p className="text-xs text-red-600">
                            {doc.expires_at
                                ? `Caducó el ${new Date(doc.expires_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}.`
                                : 'El plazo de firma ha finalizado.'}
                            {' '}Crea un nuevo documento si necesitas continuar.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex gap-6 items-start">
                <div className="flex-1 min-w-0">
                    <div className="bg-gray-100 rounded-xl overflow-hidden">
                        <div className="bg-white border-b border-gray-200 flex items-center justify-between px-4 py-2">
                            <span className="text-sm text-gray-500 truncate">{doc.original_filename}</span>
                            <div className="flex items-center gap-3 shrink-0">
                                <button disabled={pageNumber <= 1} onClick={() => setPageNumber((p) => p - 1)}
                                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-40">
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>
                                <span className="text-sm text-gray-600 whitespace-nowrap">
                                    {pageNumber} / {numPages ?? '—'}
                                </span>
                                <button disabled={pageNumber >= numPages} onClick={() => setPageNumber((p) => p + 1)}
                                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-40">
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-center p-4 overflow-auto max-h-[calc(100vh-280px)]">
                            {doc.preview_url ? (
                                <Document
                                    file={doc.preview_url}
                                    onLoadSuccess={onDocumentLoadSuccess}
                                    loading={<div className="flex items-center justify-center h-64 w-full"><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>}
                                    error={<div className="flex items-center justify-center h-64 w-full text-red-500 text-sm">No se pudo cargar el PDF.</div>}
                                >
                                    <Page pageNumber={pageNumber} width={600} renderTextLayer renderAnnotationLayer />
                                </Document>
                            ) : (
                                <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Vista previa no disponible.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="w-80 shrink-0 space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Información</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Creado</span>
                                <span className="text-gray-800">{new Date(doc.created_at).toLocaleDateString('es-ES')}</span>
                            </div>
                            {doc.expires_at && (
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-500">{isExpired ? 'Caducó' : 'Caduca'}</span>
                                    <span className={expiryColor() ?? 'text-gray-800'}>
                                        {new Date(doc.expires_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            )}
                            {doc.user && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Propietario</span>
                                    <span className="text-gray-800">{doc.user.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Firmantes {hasSigner && `(${doc.signers.length})`}
                            </h2>
                            {isDraft && !showAddForm && (
                                <button
                                    onClick={() => { setShowAddForm(true); setSignerForm({ ...EMPTY_SIGNER, order: (doc.signers?.length ?? 0) + 1 }); }}
                                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    <UserPlusIcon className="w-3.5 h-3.5" /> Añadir
                                </button>
                            )}
                        </div>

                        {!hasSigner && !showAddForm && (
                            <p className="text-sm text-gray-400">Sin firmantes asignados.</p>
                        )}

                        {hasSigner && (
                            <ul className="space-y-2">
                                {[...doc.signers].sort((a, b) => a.order - b.order).map((signer) => (
                                    <li key={signer.id} className="flex items-start gap-2">
                                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold shrink-0 mt-0.5">
                                            {signer.order}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{signer.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{signer.email}</p>
                                            <span className={`inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-xs font-medium ${SIGNER_BADGE[signer.status]}`}>
                                                {SIGNER_ICON[signer.status]}
                                                {SIGNER_LABEL[signer.status]}
                                            </span>
                                        </div>
                                        {isDraft && (
                                            <button
                                                onClick={() => removeSignerMutation.mutate(signer.id)}
                                                disabled={removeSignerMutation.isPending}
                                                className="text-gray-300 hover:text-red-500 transition-colors shrink-0 mt-0.5"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {showAddForm && (
                            <form onSubmit={handleAddSigner} className="space-y-2 pt-2 border-t border-gray-100">
                                <div>
                                    <input
                                        type="text" placeholder="Nombre completo"
                                        value={signerForm.name}
                                        onChange={(e) => setSignerForm((f) => ({ ...f, name: e.target.value }))}
                                        required
                                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    />
                                    {signerErrors.name && <p className="text-xs text-red-500 mt-0.5">{signerErrors.name[0]}</p>}
                                </div>
                                <div>
                                    <input
                                        type="email" placeholder="Email"
                                        value={signerForm.email}
                                        onChange={(e) => setSignerForm((f) => ({ ...f, email: e.target.value }))}
                                        required
                                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    />
                                    {signerErrors.email && <p className="text-xs text-red-500 mt-0.5">{signerErrors.email[0]}</p>}
                                </div>
                                <div>
                                    <input
                                        type="number" placeholder="Orden" min="1"
                                        value={signerForm.order}
                                        onChange={(e) => setSignerForm((f) => ({ ...f, order: parseInt(e.target.value) || 1 }))}
                                        required
                                        className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    />
                                    {signerErrors.order && <p className="text-xs text-red-500 mt-0.5">{signerErrors.order[0]}</p>}
                                </div>
                                {addSignerMutation.isError && !Object.keys(signerErrors).length && (
                                    <p className="text-xs text-red-500">{addSignerMutation.error?.response?.data?.message}</p>
                                )}
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => { setShowAddForm(false); setSignerErrors({}); }}
                                        className="flex-1 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={addSignerMutation.isPending}
                                        className="flex-1 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                                        {addSignerMutation.isPending ? 'Añadiendo…' : 'Añadir firmante'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {isDraft && hasSigner && !showAddForm && (
                            <button
                                onClick={handleSend}
                                disabled={sendMutation.isPending}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors mt-2"
                            >
                                <PaperAirplaneIcon className="w-4 h-4" />
                                {sendMutation.isPending ? 'Enviando…' : 'Enviar para firma'}
                            </button>
                        )}
                        {sendMutation.isSuccess && (
                            <p className="text-xs text-green-600 text-center">Documento enviado. Los firmantes recibirán un email.</p>
                        )}
                    </div>

                    {isCompleted && (
                        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">PDF firmado</h2>
                            {doc.has_signed_file ? (
                                <DownloadButton documentId={id} />
                            ) : (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin shrink-0" />
                                    Preparando PDF sellado…
                                </div>
                            )}
                        </div>
                    )}

                    {isDraft && (
                        <button
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                            {deleteMutation.isPending ? 'Eliminando…' : 'Eliminar documento'}
                        </button>
                    )}

                    {doc.events && doc.events.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Historial</h2>
                            <ul className="space-y-2">
                                {doc.events.map((ev) => (
                                    <li key={ev.id} className="flex items-start gap-2">
                                        <span className="mt-0.5 shrink-0">
                                            {EVENT_ICON[ev.type] ?? <div className="w-3.5 h-3.5 rounded-full bg-indigo-200 mt-0.5" />}
                                        </span>
                                        <div>
                                            <p className="text-sm text-gray-700">{EVENT_LABEL[ev.type] ?? ev.type}</p>
                                            <p className="text-xs text-gray-400">{new Date(ev.created_at).toLocaleString('es-ES')}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
