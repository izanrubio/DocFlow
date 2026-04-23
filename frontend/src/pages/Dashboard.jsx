import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, DocumentTextIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import UploadDocumentModal from '../components/UploadDocumentModal';
import { getDocuments } from '../api/documents';

const STATUS_TABS = [
    { label: 'Todos',      value: '' },
    { label: 'Borrador',   value: 'draft' },
    { label: 'Enviado',    value: 'sent' },
    { label: 'En proceso', value: 'in_progress' },
    { label: 'Completado', value: 'completed' },
    { label: 'Expirado',   value: 'expired' },
    { label: 'Cancelado',  value: 'cancelled' },
];

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

function ExpiryBadge({ doc }) {
    if (!doc.expires_at || !['sent', 'in_progress'].includes(doc.status)) return null;

    const msLeft  = new Date(doc.expires_at) - Date.now();
    const daysLeft = msLeft / 86400000;

    if (daysLeft < 0) return null;

    if (daysLeft < 2) {
        return (
            <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold">
                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                ¡Caduca pronto!
            </span>
        );
    }
    if (daysLeft < 7) {
        return (
            <span className="text-xs text-yellow-600 font-medium">
                Caduca en {Math.ceil(daysLeft)}d
            </span>
        );
    }
    return (
        <span className="text-xs text-green-600">
            Caduca en {Math.ceil(daysLeft)}d
        </span>
    );
}

function SkeletonRow() {
    return (
        <tr>
            {[...Array(5)].map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                </td>
            ))}
        </tr>
    );
}

export default function Dashboard() {
    const navigate              = useNavigate();
    const [status, setStatus]   = useState('');
    const [page, setPage]       = useState(1);
    const [showModal, setShowModal] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['documents', { status, page }],
        queryFn:  () => getDocuments({ status: status || undefined, page }).then((r) => r.data),
        placeholderData: (prev) => prev,
        refetchInterval: 30000,
    });

    const documents = data?.data ?? [];
    const meta      = data?.meta ?? {};

    const handleTabChange = (val) => { setStatus(val); setPage(1); };

    return (
        <Layout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Mis documentos</h1>
                <div className="flex items-center gap-2">
                    <Link
                        to="/templates"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Desde plantilla
                    </Link>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Subir documento
                    </button>
                </div>
            </div>

            <div className="flex gap-1 mb-4 flex-wrap">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => handleTabChange(tab.value)}
                        className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors
                            ${status === tab.value
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Firmantes</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                            <th className="text-left px-4 py-3 font-medium text-gray-600">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading
                            ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                            : documents.length === 0
                            ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-16 text-center">
                                        <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No hay documentos</p>
                                        <p className="text-gray-400 text-xs mt-1">
                                            Sube tu primer documento para empezar.
                                        </p>
                                    </td>
                                </tr>
                            )
                            : documents.map((doc) => (
                                <tr
                                    key={doc.id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => navigate(`/documents/${doc.id}`)}
                                >
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900 truncate max-w-xs">{doc.title}</p>
                                        <p className="text-xs text-gray-400 truncate">{doc.original_filename}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[doc.status]}`}>
                                            {doc.status === 'completed' && <CheckCircleIcon className="w-3.5 h-3.5" />}
                                            {STATUS_LABEL[doc.status] ?? doc.status}
                                        </span>
                                    </td>
                                    <td
                                        className="px-4 py-3 text-gray-600"
                                        title={doc.signers?.length
                                            ? doc.signers.map((s) => `${s.name}: ${s.status}`).join('\n')
                                            : 'Sin firmantes'}
                                    >
                                        {doc.signers_signed_count ?? 0}/{doc.signers_count ?? 0} firmaron
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        <div>{new Date(doc.created_at).toLocaleDateString('es-ES')}</div>
                                        <ExpiryBadge doc={doc} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/documents/${doc.id}`); }}
                                            className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                                        >
                                            Ver
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>

                {meta.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                            Página {meta.current_page} de {meta.last_page} · {meta.total} documentos
                        </p>
                        <div className="flex gap-1">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                            </button>
                            <button
                                disabled={page >= meta.last_page}
                                onClick={() => setPage((p) => p + 1)}
                                className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                            >
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showModal && <UploadDocumentModal onClose={() => setShowModal(false)} />}
        </Layout>
    );
}
