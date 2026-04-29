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
import { usePermissions } from '../hooks/usePermissions';

function greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 20) return 'Buenas tardes';
    return 'Buenas noches';
}

/* border-color via inline style to avoid Tailwind purge on dynamic classes */
const EVENT_META = {
    created:       { Icon: DocumentTextIcon, iconCls: 'text-slate-500',  iconBg: '#f1f5f9', borderColor: '#94a3b8', label: 'Documento creado'       },
    sent:          { Icon: PaperAirplaneIcon, iconCls: 'text-blue-600',  iconBg: '#dbeafe', borderColor: '#3b82f6', label: 'Enviado para firma'       },
    viewed:        { Icon: EyeIcon,           iconCls: 'text-violet-600', iconBg: '#ede9fe', borderColor: '#8b5cf6', label: 'Visto por firmante'       },
    signed:        { Icon: PencilSquareIcon,  iconCls: 'text-emerald-600',iconBg: '#d1fae5', borderColor: '#10b981', label: 'Firmado'                  },
    rejected:      { Icon: XCircleIcon,       iconCls: 'text-red-600',   iconBg: '#fee2e2', borderColor: '#ef4444', label: 'Rechazado'                 },
    completed:     { Icon: CheckCircleIcon,   iconCls: 'text-emerald-600',iconBg: '#d1fae5', borderColor: '#10b981', label: 'Completado'               },
    expired:       { Icon: CalendarDaysIcon,  iconCls: 'text-orange-600', iconBg: '#ffedd5', borderColor: '#f97316', label: 'Expirado'                 },
    reminder_sent: { Icon: BellAlertIcon,     iconCls: 'text-amber-600',  iconBg: '#fef3c7', borderColor: '#f59e0b', label: 'Recordatorio enviado'     },
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

/* ── Stat card ─────────────────────────────────────────────────── */
function StatCard({ icon: Icon, gradient, iconBg, iconColor, label, value, sub, subRed, alert }) {
    return (
        <div
            className={`relative overflow-hidden bg-white rounded-2xl p-6 flex items-start gap-4 transition-all duration-200 hover:-translate-y-0.5 ${
                alert
                    ? 'shadow-[0_0_0_1.5px_#fca5a5,0_4px_16px_-4px_rgba(239,68,68,0.15)]'
                    : 'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.14)]'
            }`}
        >
            {/* gradient accent strip top */}
            <div className={`absolute inset-x-0 top-0 h-0.5 ${gradient}`} />

            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: iconBg }}
            >
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-4xl font-bold text-gray-900 mt-1 leading-none tabular-nums">{value ?? '—'}</p>
                {sub && (
                    <p className={`text-xs mt-2 font-medium ${subRed ? 'text-red-500' : 'text-gray-400'}`}>{sub}</p>
                )}
            </div>
        </div>
    );
}

function StatCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_-4px_rgba(0,0,0,0.08)] flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse shrink-0" />
            <div className="flex-1 pt-1">
                <div className="h-2 bg-gray-200 rounded-full animate-pulse w-24 mb-3" />
                <div className="h-9 bg-gray-200 rounded-lg animate-pulse w-16 mb-2" />
                <div className="h-2 bg-gray-100 rounded-full animate-pulse w-20" />
            </div>
        </div>
    );
}

/* ── Main component ─────────────────────────────────────────────── */
export default function Dashboard() {
    const { user }         = useAuth();
    const { isViewer }     = usePermissions();
    const navigate         = useNavigate();
    const [showUpload, setShowUpload] = useState(false);

    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn:  () => getDashboardStats().then((r) => r.data.data),
        refetchInterval: 60000,
    });

    const atLimit  = stats?.documents_limit !== -1 && stats?.documents_this_month >= stats?.documents_limit;
    const limitSub = stats?.documents_limit === -1 ? 'Sin límite mensual' : `de ${stats?.documents_limit} este mes`;

    return (
        <Layout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-[2rem] font-bold text-gray-900 tracking-tight leading-tight">
                    {greeting()}, {user?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-sm text-gray-500 mt-1.5">
                    Aquí tienes un resumen de tu actividad en DocFlow.
                </p>
            </div>

            {/* ── Métricas ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {isLoading ? (
                    [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
                ) : (
                    <>
                        <StatCard
                            icon={DocumentTextIcon}
                            gradient="bg-gradient-to-r from-indigo-500 to-violet-500"
                            iconBg="#eef2ff"
                            iconColor="text-indigo-600"
                            label="Documentos este mes"
                            value={stats?.documents_this_month}
                            sub={limitSub}
                            subRed={atLimit}
                            alert={atLimit}
                        />
                        <StatCard
                            icon={CheckCircleIcon}
                            gradient="bg-gradient-to-r from-emerald-400 to-teal-500"
                            iconBg="#d1fae5"
                            iconColor="text-emerald-600"
                            label="Completados"
                            value={stats?.documents_completed}
                            sub="histórico total"
                        />
                        <StatCard
                            icon={ClockIcon}
                            gradient="bg-gradient-to-r from-amber-400 to-orange-400"
                            iconBg="#fef3c7"
                            iconColor="text-amber-600"
                            label="Pendientes de firma"
                            value={stats?.documents_pending}
                            sub="enviados o en proceso"
                        />
                        <StatCard
                            icon={UserGroupIcon}
                            gradient="bg-gradient-to-r from-blue-400 to-sky-500"
                            iconBg="#dbeafe"
                            iconColor="text-blue-600"
                            label="Firmantes esperando"
                            value={stats?.signers_waiting}
                            sub="pendientes o han visto"
                        />
                    </>
                )}
            </div>

            {/* ── Cuerpo en 3 columnas ────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Actividad reciente — 2/3 */}
                <div className="lg:col-span-2 bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_-4px_rgba(0,0,0,0.08)]">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900">Actividad reciente</h2>
                        <Link to="/documents" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                            Ver documentos <ArrowRightIcon className="w-3.5 h-3.5" />
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
                        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <DocumentTextIcon className="w-6 h-6 text-gray-300" />
                            </div>
                            <p className="text-sm font-medium text-gray-500">Sin actividad reciente</p>
                            <p className="text-xs text-gray-400 mt-1">Los eventos de tus documentos aparecerán aquí.</p>
                        </div>
                    ) : (
                        <ul>
                            {stats.recent_events.map((ev, idx) => {
                                const meta = EVENT_META[ev.type] ?? EVENT_META.created;
                                const { Icon, iconCls, iconBg, borderColor, label } = meta;
                                return (
                                    <li
                                        key={ev.id}
                                        onClick={() => navigate(`/documents/${ev.document_id}`)}
                                        className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors hover:bg-slate-50 border-l-4 ${idx % 2 !== 0 ? 'bg-gray-50/50' : 'bg-white'}`}
                                        style={{ borderLeftColor: borderColor }}
                                    >
                                        <div
                                            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                                            style={{ background: iconBg }}
                                        >
                                            <Icon className={`w-4 h-4 ${iconCls}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{ev.document_title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
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
                    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_-4px_rgba(0,0,0,0.08)] p-5">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
                        <div className="flex flex-col gap-2.5">
                            <button
                                onClick={() => setShowUpload(true)}
                                disabled={isViewer}
                                title={isViewer ? 'No tienes permisos para crear documentos' : undefined}
                                className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50 disabled:hover:shadow-none disabled:active:scale-100"
                                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                            >
                                <PlusIcon className="w-4 h-4" />
                                Subir documento
                            </button>
                            <button
                                onClick={() => navigate('/templates')}
                                disabled={isViewer}
                                title={isViewer ? 'No tienes permisos para crear documentos' : undefined}
                                className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200"
                            >
                                <RectangleStackIcon className="w-4 h-4 text-gray-400" />
                                Desde plantilla
                            </button>
                            <Link
                                to="/documents"
                                className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold rounded-xl transition-colors"
                                style={{ background: '#eef2ff', color: '#4f46e5' }}
                            >
                                <DocumentTextIcon className="w-4 h-4" />
                                Ver documentos
                            </Link>
                        </div>
                    </div>

                    {/* Pendientes de firma */}
                    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_-4px_rgba(0,0,0,0.08)] flex-1 overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-900">Pendientes de firma</h2>
                            <Link to="/documents" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
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
                                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: '#d1fae5' }}>
                                    <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                                </div>
                                <p className="text-sm font-semibold text-gray-700">Todo al día</p>
                                <p className="text-xs text-gray-400 mt-0.5">Sin documentos pendientes.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-50">
                                {stats.pending_documents.map((doc) => {
                                    const pct = doc.signers_total > 0
                                        ? Math.round((doc.signers_signed / doc.signers_total) * 100)
                                        : 0;
                                    const barColor = pct === 0 ? '#d1d5db' : pct === 100 ? '#10b981' : '#f59e0b';
                                    const badgeBg  = doc.status === 'sent' ? '#dbeafe' : '#fef3c7';
                                    const badgeTxt = doc.status === 'sent' ? '#1d4ed8' : '#92400e';

                                    return (
                                        <li key={doc.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-start justify-between gap-2 mb-2.5">
                                                <p className="text-sm font-semibold text-gray-900 truncate flex-1 leading-tight">{doc.title}</p>
                                                <button
                                                    onClick={() => navigate(`/documents/${doc.id}`)}
                                                    className="text-xs font-semibold shrink-0 transition-colors"
                                                    style={{ color: '#6366f1' }}
                                                >
                                                    Ver →
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2 mb-2.5">
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${pct}%`, background: barColor }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-400 shrink-0 tabular-nums">
                                                    {doc.signers_signed}/{doc.signers_total}
                                                </span>
                                            </div>

                                            <span
                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                                                style={{ background: badgeBg, color: badgeTxt }}
                                            >
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
