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

const EVENT_META = {
    created:       { Icon: DocumentTextIcon, color: 'text-gray-500',   bg: 'bg-gray-100',    border: 'border-gray-300'   },
    sent:          { Icon: PaperAirplaneIcon, color: 'text-blue-600',   bg: 'bg-blue-50',     border: 'border-blue-400'   },
    viewed:        { Icon: EyeIcon,           color: 'text-indigo-600', bg: 'bg-indigo-50',   border: 'border-indigo-400' },
    signed:        { Icon: PencilSquareIcon,  color: 'text-green-600',  bg: 'bg-green-50',    border: 'border-green-400'  },
    rejected:      { Icon: XCircleIcon,       color: 'text-red-600',    bg: 'bg-red-50',      border: 'border-red-400'    },
    completed:     { Icon: CheckCircleIcon,   color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-400'},
    expired:       { Icon: CalendarDaysIcon,  color: 'text-orange-600', bg: 'bg-orange-50',   border: 'border-orange-400' },
    reminder_sent: { Icon: BellAlertIcon,     color: 'text-yellow-600', bg: 'bg-yellow-50',   border: 'border-yellow-400' },
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
    in_progress: 'bg-amber-100 text-amber-700',
};

function timeAgo(isoString) {
    const diff  = Date.now() - new Date(isoString).getTime();
    const mins  = Math.floor(diff / 60000);
    if (mins < 1)  return 'ahora mismo';
    if (mins < 60) return `hace ${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    return `hace ${Math.floor(hrs / 24)}d`;
}

function progressColor(pct) {
    if (pct === 0)   return 'bg-gray-300';
    if (pct === 100) return 'bg-emerald-500';
    return 'bg-amber-400';
}

/* ── Stat card ─────────────────────────────────────────────────── */
function StatCard({ icon: Icon, accentBg, accentText, label, value, sub, subColor, alert }) {
    return (
        <div className={`group bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-start gap-4 ${alert ? 'ring-1 ring-red-300' : 'ring-1 ring-gray-100'}`}>
            <div className={`w-12 h-12 rounded-xl ${accentBg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-6 h-6 ${accentText}`} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1 leading-none">{value ?? '—'}</p>
                {sub && (
                    <p className={`text-xs mt-1.5 font-medium ${subColor ?? 'text-gray-400'}`}>{sub}</p>
                )}
            </div>
        </div>
    );
}

function StatCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse shrink-0" />
            <div className="flex-1 pt-1">
                <div className="h-2.5 bg-gray-200 rounded animate-pulse w-24 mb-3" />
                <div className="h-8 bg-gray-200 rounded animate-pulse w-14 mb-2" />
                <div className="h-2 bg-gray-100 rounded animate-pulse w-20" />
            </div>
        </div>
    );
}

/* ── Main component ─────────────────────────────────────────────── */
export default function Dashboard() {
    const { user }  = useAuth();
    const navigate  = useNavigate();
    const [showUpload, setShowUpload] = useState(false);

    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn:  () => getDashboardStats().then((r) => r.data.data),
        refetchInterval: 60000,
    });

    const atLimit   = stats?.documents_limit !== -1 && stats?.documents_this_month >= stats?.documents_limit;
    const limitSub  = stats?.documents_limit === -1 ? 'Sin límite mensual' : `de ${stats?.documents_limit} este mes`;

    return (
        <Layout>
            {/* Header con gradiente sutil */}
            <div className="mb-8 px-1">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {greeting()}, {user?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-sm text-gray-500 mt-1.5">
                    Aquí tienes un resumen de tu actividad en DocFlow.
                </p>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {isLoading ? (
                    [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
                ) : (
                    <>
                        <StatCard
                            icon={DocumentTextIcon}
                            accentBg="bg-indigo-100"
                            accentText="text-indigo-600"
                            label="Documentos este mes"
                            value={stats?.documents_this_month}
                            sub={limitSub}
                            subColor={atLimit ? 'text-red-500' : 'text-gray-400'}
                            alert={atLimit}
                        />
                        <StatCard
                            icon={CheckCircleIcon}
                            accentBg="bg-emerald-100"
                            accentText="text-emerald-600"
                            label="Completados"
                            value={stats?.documents_completed}
                            sub="histórico total"
                        />
                        <StatCard
                            icon={ClockIcon}
                            accentBg="bg-amber-100"
                            accentText="text-amber-600"
                            label="Pendientes de firma"
                            value={stats?.documents_pending}
                            sub="enviados o en proceso"
                        />
                        <StatCard
                            icon={UserGroupIcon}
                            accentBg="bg-blue-100"
                            accentText="text-blue-600"
                            label="Firmantes esperando"
                            value={stats?.signers_waiting}
                            sub="pendientes o han visto"
                        />
                    </>
                )}
            </div>

            {/* Cuerpo en dos columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Actividad reciente — 2/3 */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900">Actividad reciente</h2>
                        <Link to="/documents" className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium">
                            Ver documentos <ArrowRightIcon className="w-3 h-3" />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="divide-y divide-gray-50">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex items-center gap-4 px-6 py-4">
                                    <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse shrink-0" />
                                    <div className="flex-1">
                                        <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4 mb-2" />
                                        <div className="h-2.5 bg-gray-100 rounded animate-pulse w-1/2" />
                                    </div>
                                    <div className="h-2.5 bg-gray-100 rounded animate-pulse w-14" />
                                </div>
                            ))}
                        </div>
                    ) : !stats?.recent_events?.length ? (
                        <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                            <DocumentTextIcon className="w-10 h-10 text-gray-200 mb-3" />
                            <p className="text-sm text-gray-400 font-medium">Sin actividad reciente</p>
                            <p className="text-xs text-gray-300 mt-1">Los eventos de tus documentos aparecerán aquí.</p>
                        </div>
                    ) : (
                        <ul>
                            {stats.recent_events.map((ev, idx) => {
                                const { Icon, color, bg, border } = EVENT_META[ev.type] ?? EVENT_META.created;
                                const isEven = idx % 2 === 0;
                                return (
                                    <li
                                        key={ev.id}
                                        onClick={() => navigate(`/documents/${ev.document_id}`)}
                                        className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors hover:bg-indigo-50/50 border-l-4 ${border} ${isEven ? 'bg-white' : 'bg-gray-50/60'}`}
                                    >
                                        <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center shrink-0 ring-1 ring-white`}>
                                            <Icon className={`w-4 h-4 ${color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{ev.document_title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{EVENT_LABELS[ev.type] ?? ev.type}</p>
                                        </div>
                                        <span className="text-xs text-gray-400 shrink-0 tabular-nums">{timeAgo(ev.created_at)}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Columna derecha */}
                <div className="flex flex-col gap-5">

                    {/* Acciones rápidas */}
                    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
                        <div className="flex flex-col gap-2.5">
                            <button
                                onClick={() => setShowUpload(true)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-sm shadow-indigo-200 transition-all"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Subir documento
                            </button>
                            <Link
                                to="/templates"
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
                            >
                                <RectangleStackIcon className="w-4 h-4 text-gray-500" />
                                Desde plantilla
                            </Link>
                            <Link
                                to="/documents"
                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-indigo-700 border border-indigo-100 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
                            >
                                <DocumentTextIcon className="w-4 h-4" />
                                Ver documentos
                            </Link>
                        </div>
                    </div>

                    {/* Pendientes de firma */}
                    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 flex-1 overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-900">Pendientes de firma</h2>
                            <Link to="/documents" className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium">
                                Ver todos <ArrowRightIcon className="w-3 h-3" />
                            </Link>
                        </div>

                        {isLoading ? (
                            <div className="divide-y divide-gray-50">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="px-5 py-4">
                                        <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4 mb-3" />
                                        <div className="h-2 bg-gray-100 rounded-full animate-pulse w-full" />
                                    </div>
                                ))}
                            </div>
                        ) : !stats?.pending_documents?.length ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center px-5">
                                <CheckCircleIcon className="w-10 h-10 text-emerald-300 mb-2" />
                                <p className="text-sm font-medium text-gray-500">Todo al día</p>
                                <p className="text-xs text-gray-400 mt-0.5">Sin documentos pendientes.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-50">
                                {stats.pending_documents.map((doc) => {
                                    const pct = doc.signers_total > 0
                                        ? Math.round((doc.signers_signed / doc.signers_total) * 100)
                                        : 0;
                                    const bar = progressColor(pct);
                                    return (
                                        <li key={doc.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <p className="text-sm font-semibold text-gray-900 truncate flex-1 leading-tight">{doc.title}</p>
                                                <button
                                                    onClick={() => navigate(`/documents/${doc.id}`)}
                                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 shrink-0 transition-colors"
                                                >
                                                    Ver →
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${bar}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-400 shrink-0 tabular-nums">
                                                    {doc.signers_signed}/{doc.signers_total}
                                                </span>
                                            </div>

                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[doc.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {doc.status === 'sent' ? 'Enviado' : 'En proceso'}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {showUpload && <UploadDocumentModal onClose={() => setShowUpload(false)} />}
        </Layout>
    );
}
