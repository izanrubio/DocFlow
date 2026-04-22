import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Document, Page, pdfjs } from 'react-pdf';
import {
    ArrowLeftIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    TrashIcon,
    UserPlusIcon,
    CheckCircleIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import { getDocument, deleteDocument } from '../api/documents';

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
    draft:       'Borrador',
    sent:        'Enviado',
    in_progress: 'En proceso',
    completed:   'Completado',
    expired:     'Expirado',
    cancelled:   'Cancelado',
};

const EVENT_LABEL = {
    created:       'Documento creado',
    sent:          'Enviado a firmantes',
    viewed:        'Visualizado',
    signed:        'Firmado',
    rejected:      'Rechazado',
    completed:     'Completado',
    expired:       'Expirado',
    reminder_sent: 'Recordatorio enviado',
};

export default function DocumentDetail() {
    const { id }       = useParams();
    const navigate     = useNavigate();
    const queryClient  = useQueryClient();

    const [numPages, setNumPages]       = useState(null);
    const [pageNumber, setPageNumber]   = useState(1);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['document', id],
        queryFn:  () => getDocument(id).then((r) => r.data.data),
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteDocument(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            navigate('/dashboard');
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

    if (isLoading) {
        return (
            <Layout>
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                    <div className="flex gap-6 mt-4">
                        <div className="flex-1 h-96 bg-gray-200 rounded-xl" />
                        <div className="w-80 space-y-3">
                            <div className="h-6 bg-gray-200 rounded w-2/3" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (isError || !data) {
        return (
            <Layout>
                <p className="text-red-600">No se pudo cargar el documento.</p>
            </Layout>
        );
    }

    const doc = data;

    return (
        <Layout>
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-gray-900 truncate">{doc.title}</h1>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[doc.status]}`}>
                    {STATUS_LABEL[doc.status] ?? doc.status}
                </span>
            </div>

            <div className="flex gap-6 items-start">
                <div className="flex-1 min-w-0">
                    <div className="bg-gray-100 rounded-xl overflow-hidden">
                        <div className="bg-white border-b border-gray-200 flex items-center justify-between px-4 py-2">
                            <span className="text-sm text-gray-500 truncate">{doc.original_filename}</span>
                            <div className="flex items-center gap-3 shrink-0">
                                <button
                                    disabled={pageNumber <= 1}
                                    onClick={() => setPageNumber((p) => p - 1)}
                                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>
                                <span className="text-sm text-gray-600 whitespace-nowrap">
                                    {pageNumber} / {numPages ?? '—'}
                                </span>
                                <button
                                    disabled={pageNumber >= numPages}
                                    onClick={() => setPageNumber((p) => p + 1)}
                                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-center p-4 overflow-auto max-h-[calc(100vh-280px)]">
                            {doc.preview_url ? (
                                <Document
                                    file={doc.preview_url}
                                    onLoadSuccess={onDocumentLoadSuccess}
                                    loading={
                                        <div className="flex items-center justify-center h-64 w-full">
                                            <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
                                        </div>
                                    }
                                    error={
                                        <div className="flex items-center justify-center h-64 w-full text-red-500 text-sm">
                                            No se pudo cargar el PDF.
                                        </div>
                                    }
                                >
                                    <Page
                                        pageNumber={pageNumber}
                                        width={600}
                                        renderTextLayer
                                        renderAnnotationLayer
                                    />
                                </Document>
                            ) : (
                                <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                                    Vista previa no disponible.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="w-80 shrink-0 space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            Información
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Creado</span>
                                <span className="text-gray-800">
                                    {new Date(doc.created_at).toLocaleDateString('es-ES')}
                                </span>
                            </div>
                            {doc.expires_at && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Expira</span>
                                    <span className="text-gray-800">
                                        {new Date(doc.expires_at).toLocaleDateString('es-ES')}
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
                            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                Firmantes
                            </h2>
                            <button className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                <UserPlusIcon className="w-3.5 h-3.5" />
                                Añadir
                            </button>
                        </div>
                        {!doc.signers || doc.signers.length === 0 ? (
                            <p className="text-sm text-gray-400">Sin firmantes asignados.</p>
                        ) : (
                            <ul className="space-y-2">
                                {doc.signers.map((signer) => (
                                    <li key={signer.id} className="flex items-center gap-2">
                                        {signer.status === 'signed' ? (
                                            <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />
                                        ) : (
                                            <ClockIcon className="w-4 h-4 text-gray-400 shrink-0" />
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {signer.name}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">{signer.email}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {doc.status === 'draft' && (
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
                            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                Historial
                            </h2>
                            <ul className="space-y-2">
                                {doc.events.map((ev) => (
                                    <li key={ev.id} className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                {EVENT_LABEL[ev.type] ?? ev.type}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(ev.created_at).toLocaleString('es-ES')}
                                            </p>
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
