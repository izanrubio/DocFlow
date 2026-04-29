import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    PlusIcon,
    DocumentTextIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    FunnelIcon,
    AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import UploadDocumentModal from '../components/UploadDocumentModal';
import { getDocuments } from '../api/documents';
import { usePermissions } from '../hooks/usePermissions';

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

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function Highlight({ text, term }) {
    if (!term || !text) return <>{text}</>;
    const parts = text.split(new RegExp(`(${escapeRegex(term)})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === term.toLowerCase()
                    ? <mark key={i} style={{ background: '#fef08a', borderRadius: '2px', padding: '0 1px', fontWeight: 600 }}>{part}</mark>
                    : part
            )}
        </>
    );
}

function ExpiryBadge({ doc }) {
    if (!doc.expires_at || !['sent', 'in_progress'].includes(doc.status)) return null;
    const daysLeft = (new Date(doc.expires_at) - Date.now()) / 86400000;
    if (daysLeft < 0) return null;
    if (daysLeft < 2) return (
        <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold">
            <ExclamationTriangleIcon className="w-3.5 h-3.5" />¡Caduca pronto!
        </span>
    );
    if (daysLeft < 7) return <span className="text-xs text-yellow-600 font-medium">Caduca en {Math.ceil(daysLeft)}d</span>;
    return <span className="text-xs text-green-600">Caduca en {Math.ceil(daysLeft)}d</span>;
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

function EmptySearch({ term }) {
    return (
        <tr>
            <td colSpan={5} className="px-4 py-16 text-center">
                <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No se encontraron documentos para tu búsqueda</p>
                {term && (
                    <p className="text-gray-400 text-xs mt-1">
                        Prueba con otros términos para «{term}».
                    </p>
                )}
            </td>
        </tr>
    );
}

export default function Documents() {
    const { isViewer }         = usePermissions();
    const navigate             = useNavigate();
    const location             = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const urlStatus      = searchParams.get('status')       ?? '';
    const urlSearch      = searchParams.get('search')       ?? '';
    const urlSignerEmail = searchParams.get('signer_email') ?? '';
    const urlDateFrom    = searchParams.get('date_from')    ?? '';
    const urlDateTo      = searchParams.get('date_to')      ?? '';
    const urlPage        = parseInt(searchParams.get('page') ?? '1', 10);

    const [searchInput, setSearchInput] = useState(urlSearch);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [pending, setPending]         = useState({
        signer_email: urlSignerEmail,
        date_from:    urlDateFrom,
        date_to:      urlDateTo,
    });
    const [showModal, setShowModal] = useState(false);
    const [dateError, setDateError] = useState('');

    // Apply location.state filter on first render (from Dashboard links)
    useEffect(() => {
        const initial = location.state?.filterStatus;
        if (initial && !searchParams.get('status')) {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('status', initial);
                return next;
            }, { replace: true });
        }
    }, []); // eslint-disable-line

    // Keep local inputs in sync when URL changes (browser back/forward)
    useEffect(() => {
        setSearchInput(urlSearch);
        setPending({ signer_email: urlSignerEmail, date_from: urlDateFrom, date_to: urlDateTo });
    }, [urlSearch, urlSignerEmail, urlDateFrom, urlDateTo]);

    // Debounce search → URL
    useEffect(() => {
        const t = setTimeout(() => {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                searchInput ? next.set('search', searchInput) : next.delete('search');
                next.delete('page');
                return next;
            }, { replace: true });
        }, 400);
        return () => clearTimeout(t);
    }, [searchInput]); // eslint-disable-line

    const setParam = (key, val) =>
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            val ? next.set(key, val) : next.delete(key);
            next.delete('page');
            return next;
        }, { replace: true });

    const handleTabChange = (val) => setParam('status', val);

    const applyFilters = () => {
        if (pending.date_from && pending.date_to && pending.date_from > pending.date_to) {
            setDateError('La fecha "desde" no puede ser posterior a la fecha "hasta".');
            return;
        }
        setDateError('');
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            pending.signer_email ? next.set('signer_email', pending.signer_email) : next.delete('signer_email');
            pending.date_from    ? next.set('date_from',    pending.date_from)    : next.delete('date_from');
            pending.date_to      ? next.set('date_to',      pending.date_to)      : next.delete('date_to');
            next.delete('page');
            return next;
        }, { replace: true });
        setFiltersOpen(false);
    };

    const clearAdvanced = () => {
        setDateError('');
        setPending({ signer_email: '', date_from: '', date_to: '' });
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete('signer_email');
            next.delete('date_from');
            next.delete('date_to');
            next.delete('page');
            return next;
        }, { replace: true });
    };

    const clearSearch = () => {
        setSearchInput('');
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete('search');
            next.delete('page');
            return next;
        }, { replace: true });
    };

    const setPage = (p) => setParam('page', p > 1 ? String(p) : '');

    const activeAdvancedCount = [urlSignerEmail, urlDateFrom, urlDateTo].filter(Boolean).length;
    const hasAnyFilter = urlSearch || activeAdvancedCount > 0;

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['documents', { status: urlStatus, search: urlSearch, signer_email: urlSignerEmail, date_from: urlDateFrom, date_to: urlDateTo, page: urlPage }],
        queryFn: ({ signal }) => getDocuments({
            status:       urlStatus       || undefined,
            search:       urlSearch       || undefined,
            signer_email: urlSignerEmail  || undefined,
            date_from:    urlDateFrom     || undefined,
            date_to:      urlDateTo       || undefined,
            page:         urlPage,
        }, signal).then((r) => r.data),
        placeholderData: (prev) => prev,
        refetchInterval: 30000,
    });

    const documents = data?.data ?? [];
    const meta      = data?.meta ?? {};
    const isSearching = isFetching && !isLoading;

    const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

    return (
        <Layout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Mis documentos</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { if (isViewer) return; navigate('/templates'); }}
                        disabled={isViewer}
                        title={isViewer ? 'No tienes permisos para crear documentos' : undefined}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg transition-colors ${
                            isViewer
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-gray-50'
                        }`}
                    >
                        Desde plantilla
                    </button>
                    <button
                        onClick={() => { if (isViewer) return; setShowModal(true); }}
                        disabled={isViewer}
                        title={isViewer ? 'No tienes permisos para crear documentos' : undefined}
                        className={`flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${
                            isViewer ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                        <PlusIcon className="w-4 h-4" />
                        Subir documento
                    </button>
                </div>
            </div>

            {/* Search bar + Filters button */}
            <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Buscar por título o firmante..."
                        className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {isSearching && (
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-indigo-300 border-t-indigo-600 animate-spin" />
                    )}
                    {searchInput && !isSearching && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100"
                        >
                            <XMarkIcon className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                </div>

                <div className="relative">
                    <button
                        onClick={() => setFiltersOpen((o) => !o)}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg transition-colors ${filtersOpen || activeAdvancedCount > 0 ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                        <AdjustmentsHorizontalIcon className="w-4 h-4" />
                        Filtros
                        {activeAdvancedCount > 0 && (
                            <span className="bg-indigo-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {activeAdvancedCount}
                            </span>
                        )}
                    </button>

                    {filtersOpen && (
                        <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-20">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Filtros avanzados</p>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Email del firmante</label>
                                    <input
                                        type="email"
                                        value={pending.signer_email}
                                        onChange={(e) => setPending((p) => ({ ...p, signer_email: e.target.value }))}
                                        placeholder="firmante@ejemplo.com"
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Fecha desde</label>
                                    <input
                                        type="date"
                                        value={pending.date_from}
                                        onChange={(e) => { setPending((p) => ({ ...p, date_from: e.target.value })); setDateError(''); }}
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Fecha hasta</label>
                                    <input
                                        type="date"
                                        value={pending.date_to}
                                        onChange={(e) => { setPending((p) => ({ ...p, date_to: e.target.value })); setDateError(''); }}
                                        className={inputCls}
                                    />
                                </div>
                                {dateError && <p className="text-xs text-red-600">{dateError}</p>}
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={applyFilters}
                                    className="flex-1 py-1.5 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90"
                                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                                >
                                    Aplicar filtros
                                </button>
                                <button
                                    onClick={clearAdvanced}
                                    className="flex-1 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Limpiar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Status tabs */}
            <div className="flex gap-1 mb-4 flex-wrap">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => handleTabChange(tab.value)}
                        className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${urlStatus === tab.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search results summary */}
            {!isLoading && hasAnyFilter && (
                <p className="text-sm text-gray-500 mb-3">
                    <span className="font-semibold text-gray-700">{meta.total ?? documents.length}</span> documento{(meta.total ?? documents.length) !== 1 ? 's' : ''} encontrado{(meta.total ?? documents.length) !== 1 ? 's' : ''}
                    {urlSearch && <> para <span className="font-semibold text-gray-900">«{urlSearch}»</span></>}
                </p>
            )}

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
                            ? <EmptySearch term={urlSearch} />
                            : documents.map((doc) => (
                                <tr
                                    key={doc.id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => navigate(`/documents/${doc.id}`)}
                                >
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900 truncate max-w-xs">
                                            <Highlight text={doc.title} term={urlSearch} />
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">
                                            <Highlight text={doc.original_filename} term={urlSearch} />
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[doc.status]}`}>
                                            {doc.status === 'completed' && <CheckCircleIcon className="w-3.5 h-3.5" />}
                                            {STATUS_LABEL[doc.status] ?? doc.status}
                                        </span>
                                    </td>
                                    <td
                                        className="px-4 py-3 text-gray-600"
                                        title={doc.signers?.length ? doc.signers.map((s) => `${s.name}: ${s.status}`).join('\n') : 'Sin firmantes'}
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
                                disabled={urlPage <= 1}
                                onClick={() => setPage(urlPage - 1)}
                                className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                            </button>
                            <button
                                disabled={urlPage >= meta.last_page}
                                onClick={() => setPage(urlPage + 1)}
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
