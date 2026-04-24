import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    DocumentTextIcon,
    CheckCircleIcon,
    ClockIcon,
    UserGroupIcon,
    PlusIcon,
    RectangleStackIcon,
    ArrowRightIcon,
    PaperAirplaneIcon,
    PencilSquareIcon,
    EyeIcon,
    XCircleIcon,
    CalendarDaysIcon,
    BellAlertIcon,
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import UploadDocumentModal from '../components/UploadDocumentModal';
import { getDashboardStats } from '../api/dashboard';
import { useAuth } from '../hooks/useAuth';

function greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 20) return 'Buenas tardes';
    return 'Buenas noches';
}

const EVENT_ICONS = {
    created:       { Icon: DocumentTextIcon,  color: 'text-gray-500',  bg: 'bg-gray-100'   },
    sent:          { Icon: PaperAirplaneIcon,  color: 'text-blue-600',  bg: 'bg-blue-100'   },
    viewed:        { Icon: EyeIcon,            color: 'text-indigo-600', bg: 'bg-indigo-100' },
    signed:        { Icon: PencilSquareIcon,   color: 'text-green-600', bg: 'bg-green-100'  },
    rejected:      { Icon: XCircleIcon,        color: 'text-red-600',   bg: 'bg-red-100'    },
    completed:     { Icon: CheckCircleIcon,    color: 'text-green-600', bg: 'bg-green-100'  },
    expired:       { Icon: CalendarDaysIcon,   color: 'text-red-500',   bg: 'bg-red-100'    },
    reminder_sent: { Icon: BellAlertIcon,      color: 'text-yellow-600', bg: 'bg-yellow-100'},
};

const EVENT_LABELS = {
    created:       'Documento creado',
    sent:          'Enviado para firma',
    viewed:        'Visto por firmante',
    signed:        'Firmado',
    rejected:      'Rechazado',
    completed:     'Completado',
    expired:       'Expirado',
    reminder_sent: 'Recordatorio enviado',
};

const STATUS_BADGE = {
    sent:        'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
};

function timeAgo(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins  = Math.floor(diff / 60000);
    if (mins < 1)  return 'ahora mismo';
    if (mins < 60) return `hace ${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `hace ${days}d`;
}

function StatCard({ icon: Icon, iconColor, iconBg, label, value, sub, subColor }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{value ?? '—'}</p>
                {sub && <p className={`text-xs mt-0.5 ${subColor ?? 'text-gray-400'}`}>{sub}</p>}
            </div>
        </div>
    );
}

function StatCardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse shrink-0" />
            <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24 mb-2" />
                <div className="h-7 bg-gray-200 rounded animate-pulse w-12" />
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { user }   = useAuth();
    const navigate   = useNavigate();
    const [showUpload, setShowUpload] = useState(false);

    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn:  () => getDashboardStats().then((r) => r.data.data),
        refetchInterval: 60000,
    });

    const limitLabel = stats?.documents_limit === -1
        ? 'Sin límite'
        : `de ${stats?.documents_limit} este mes`;

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    {greeting()}, {user?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-sm text-gray-500 mt-1">Aquí tienes un resumen de tu actividad.</p>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
                {isLoading ? (
                    [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
                ) : (
                    <>
                        <StatCard
                            icon={DocumentTextIcon}
                            iconColor="text-indigo-600"
                            iconBg="bg-indigo-50"
                            label="Documentos este mes"
                            value={stats?.documents_this_month}
                            sub={limitLabel}
                            subColor={
                                stats?.documents_limit !== -1 && stats?.documents_this_month >= stats?.documents_limit
                                    ? 'text-red-500 font-medium'
                                    : 'text-gray-400'
                            }
                        />
                        <StatCard
                            icon={CheckCircleIcon}
                            iconColor="text-green-600"
                            iconBg="bg-green-50"
                            label="Documentos completados"
                            value={stats?.documents_completed}
                            sub="histórico total"
                        />
                        <StatCard
                            icon={ClockIcon}
                            iconColor="text-yellow-600"
                            iconBg="bg-yellow-50"
                            label="Pendientes de firma"
                            value={stats?.documents_pending}
                            sub="enviados o en proceso"
                        />
                        <StatCard
                            icon={UserGroupIcon}
                            iconColor="text-blue-600"
                            iconBg="bg-blue-50"
                            label="Firmantes esperando"
                            value={stats?.signers_waiting}
                            sub="pendientes o han visto"
                        />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Actividad reciente */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-900">Actividad reciente</h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {isLoading ? (
                            [...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 px-5 py-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse shrink-0" />
                                    <div className="flex-1">
                                        <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4 mb-1.5" />
                                        <div className="h-2.5 bg-gray-100 rounded animate-pulse w-1/2" />
                                    </div>
                                    <div className="h-2.5 bg-gray-100 rounded animate-pulse w-14" />
                                </div>
                            ))
                        ) : !stats?.recent_events?.length ? (
                            <div className="px-5 py-10 text-center">
                                <p className="text-sm text-gray-400">Sin actividad reciente.</p>
                            </div>
                        ) : (
                            stats.recent_events.map((ev) => {
                                const { Icon, color, bg } = EVENT_ICONS[ev.type] ?? EVENT_ICONS.created;
                                return (
                                    <div
                                        key={ev.id}
                                        className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/documents/${ev.document_id}`)}
                                    >
                                        <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                                            <Icon className={`w-4 h-4 ${color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{ev.document_title}</p>
                                            <p className="text-xs text-gray-500">{EVENT_LABELS[ev.type] ?? ev.type}</p>
                                        </div>
                                        <span className="text-xs text-gray-400 shrink-0">{timeAgo(ev.created_at)}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Panel derecho */}
                <div className="flex flex-col gap-6">
                    {/* Acciones rápidas */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h2 className="text-sm font-semibold text-gray-900 mb-3">Acciones rápidas</h2>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setShowUpload(true)}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Subir documento
                            </button>
                            <Link
                                to="/templates"
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <RectangleStackIcon className="w-4 h-4" />
                                Desde plantilla
                            </Link>
                        </div>
                    </div>

                    {/* Documentos pendientes */}
                    <div className="bg-white rounded-xl border border-gray-200 flex-1">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-900">Pendientes de firma</h2>
                            <Link to="/documents" className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                Ver todos <ArrowRightIcon className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {isLoading ? (
                                [...Array(3)].map((_, i) => (
                                    <div key={i} className="px-5 py-3">
                                        <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4 mb-2" />
                                        <div className="h-2 bg-gray-100 rounded animate-pulse w-1/2" />
                                    </div>
                                ))
                            ) : !stats?.pending_documents?.length ? (
                                <div className="px-5 py-8 text-center">
                                    <CheckCircleIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                    <p className="text-xs text-gray-400">Sin documentos pendientes.</p>
                                </div>
                            ) : (
                                stats.pending_documents.map((doc) => {
                                    const pct = doc.signers_total > 0
                                        ? Math.round((doc.signers_signed / doc.signers_total) * 100)
                                        : 0;
                                    return (
                                        <div key={doc.id} className="px-5 py-3">
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <p className="text-sm font-medium text-gray-900 truncate flex-1">{doc.title}</p>
                                                <button
                                                    onClick={() => navigate(`/documents/${doc.id}`)}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium shrink-0"
                                                >
                                                    Ver
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full transition-all"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-400 shrink-0">
                                                    {doc.signers_signed}/{doc.signers_total} firmaron
                                                </span>
                                            </div>
                                            <span className={`inline-flex mt-1 items-center px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[doc.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {doc.status === 'sent' ? 'Enviado' : 'En proceso'}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showUpload && <UploadDocumentModal onClose={() => setShowUpload(false)} />}
        </Layout>
    );
}
