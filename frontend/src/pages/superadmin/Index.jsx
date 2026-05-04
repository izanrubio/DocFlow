import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    BuildingOffice2Icon,
    UserGroupIcon,
    CheckCircleIcon,
    CurrencyEuroIcon,
    DocumentTextIcon,
    PaperAirplaneIcon,
    PencilSquareIcon,
    EyeIcon,
    XCircleIcon,
    CalendarDaysIcon,
    BellAlertIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';
import Layout from '../../components/Layout';
import SuperAdminBanner from '../../components/SuperAdminBanner';
import { getSuperAdminStats, getSuperAdminActivity } from '../../api/superadmin';

const SHADOW = 'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_-4px_rgba(0,0,0,0.08)]';
const SHADOW_HOVER = 'hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.14)]';

const EVENT_META = {
    created:       { Icon: DocumentTextIcon,  iconCls: 'text-slate-500',   iconBg: '#f1f5f9', label: 'Documento creado'    },
    sent:          { Icon: PaperAirplaneIcon, iconCls: 'text-blue-600',    iconBg: '#dbeafe', label: 'Enviado para firma'   },
    viewed:        { Icon: EyeIcon,           iconCls: 'text-violet-600',  iconBg: '#ede9fe', label: 'Visto'               },
    signed:        { Icon: PencilSquareIcon,  iconCls: 'text-emerald-600', iconBg: '#d1fae5', label: 'Firmado'             },
    rejected:      { Icon: XCircleIcon,       iconCls: 'text-red-600',     iconBg: '#fee2e2', label: 'Rechazado'           },
    completed:     { Icon: CheckCircleIcon,   iconCls: 'text-emerald-600', iconBg: '#d1fae5', label: 'Completado'          },
    expired:       { Icon: CalendarDaysIcon,  iconCls: 'text-orange-600',  iconBg: '#ffedd5', label: 'Expirado'            },
    reminder_sent: { Icon: BellAlertIcon,     iconCls: 'text-amber-600',   iconBg: '#fef3c7', label: 'Recordatorio enviado'},
};

function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'ahora mismo';
    if (mins < 60) return `hace ${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `hace ${hrs}h`;
    return `hace ${Math.floor(hrs / 24)}d`;
}

function StatCard({ icon: Icon, gradient, iconBg, iconColor, label, value, sub }) {
    return (
        <div className={`relative overflow-hidden bg-white rounded-2xl p-6 flex items-start gap-4 transition-all duration-200 hover:-translate-y-0.5 ${SHADOW} ${SHADOW_HOVER}`}>
            <div className={`absolute inset-x-0 top-0 h-0.5 ${gradient}`} />
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-4xl font-bold text-gray-900 mt-1 leading-none tabular-nums">{value ?? '—'}</p>
                {sub && <p className="text-xs mt-2 font-medium text-gray-400">{sub}</p>}
            </div>
        </div>
    );
}

function StatCardSkeleton() {
    return (
        <div className={`bg-white rounded-2xl p-6 ${SHADOW} flex items-start gap-4`}>
            <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse shrink-0" />
            <div className="flex-1 pt-1">
                <div className="h-2 bg-gray-200 rounded-full animate-pulse w-24 mb-3" />
                <div className="h-9 bg-gray-200 rounded-lg animate-pulse w-16 mb-2" />
                <div className="h-2 bg-gray-100 rounded-full animate-pulse w-20" />
            </div>
        </div>
    );
}

function BarChart({ data }) {
    if (!data?.length) return null;
    const max = Math.max(...data.map((d) => d.count), 1);
    const allZero = data.every((d) => d.count === 0);

    if (allZero) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm text-gray-400">Sin registros en los últimos 30 días.</p>
            </div>
        );
    }

    return (
        <div className="flex items-end gap-0.5 h-32 w-full">
            {data.map((d) => {
                const pct = (d.count / max) * 100;
                const date = new Date(d.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                return (
                    <div
                        key={d.date}
                        className="flex-1 flex flex-col items-center justify-end gap-0.5 group relative"
                        title={`${date}: ${d.count} registro${d.count !== 1 ? 's' : ''}`}
                    >
                        <div
                            className="w-full rounded-sm transition-all duration-200 group-hover:opacity-80"
                            style={{
                                height: `${Math.max(pct, d.count > 0 ? 4 : 0)}%`,
                                background: 'linear-gradient(to top, #6366f1, #8b5cf6)',
                                minHeight: d.count > 0 ? '4px' : '0',
                            }}
                        />
                        {/* tooltip */}
                        <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <div className="bg-gray-900 text-white text-[10px] font-medium px-2 py-1 rounded-md whitespace-nowrap">
                                {date}: {d.count}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function PlanBar({ label, count, total, color }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-16 shrink-0">{label}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="text-xs font-semibold text-gray-700 tabular-nums w-8 text-right">{count}</span>
        </div>
    );
}

export default function SuperAdminIndex() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['superadmin-stats'],
        queryFn:  () => getSuperAdminStats().then((r) => r.data.data),
        refetchInterval: 60000,
    });

    const { data: activityData } = useQuery({
        queryKey: ['superadmin-activity'],
        queryFn:  () => getSuperAdminActivity().then((r) => r.data.data),
    });

    const recentEvents = activityData?.slice(0, 10) ?? [];

    return (
        <Layout>
            <SuperAdminBanner />

            <div className="mb-8">
                <h1 className="text-[2rem] font-bold text-gray-900 tracking-tight leading-tight">Super Admin</h1>
                <p className="text-sm text-gray-500 mt-1.5">Vista global de todos los tenants y métricas de DocFlow.</p>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {isLoading ? [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />) : (
                    <>
                        <StatCard
                            icon={BuildingOffice2Icon}
                            gradient="bg-gradient-to-r from-indigo-500 to-violet-500"
                            iconBg="#eef2ff" iconColor="text-indigo-600"
                            label="Tenants totales"
                            value={stats?.tenants_total}
                            sub={`${stats?.tenants_free} free · ${stats?.tenants_pro} pro · ${stats?.tenants_business} business`}
                        />
                        <StatCard
                            icon={UserGroupIcon}
                            gradient="bg-gradient-to-r from-blue-400 to-sky-500"
                            iconBg="#dbeafe" iconColor="text-blue-600"
                            label="Usuarios totales"
                            value={stats?.users_total}
                            sub="registrados en total"
                        />
                        <StatCard
                            icon={CheckCircleIcon}
                            gradient="bg-gradient-to-r from-emerald-400 to-teal-500"
                            iconBg="#d1fae5" iconColor="text-emerald-600"
                            label="Documentos completados"
                            value={stats?.documents_completed}
                            sub={`de ${stats?.documents_total} totales`}
                        />
                        <StatCard
                            icon={CurrencyEuroIcon}
                            gradient="bg-gradient-to-r from-indigo-500 to-purple-600"
                            iconBg="#eef2ff" iconColor="text-indigo-600"
                            label="MRR estimado"
                            value={stats?.mrr_estimated != null ? `${stats.mrr_estimated}€` : '—'}
                            sub="ingresos recurrentes estimados"
                        />
                    </>
                )}
            </div>

            {/* Segunda fila */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* Gráfica 30 días — 2 cols */}
                <div className={`lg:col-span-2 bg-white rounded-2xl p-6 ${SHADOW}`}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-semibold text-gray-900">Nuevos tenants — últimos 30 días</h2>
                        <div className="flex gap-4 text-xs text-gray-500">
                            <span>Hoy: <strong className="text-gray-800">{stats?.new_tenants_today ?? 0}</strong></span>
                            <span>Esta semana: <strong className="text-gray-800">{stats?.new_tenants_this_week ?? 0}</strong></span>
                            <span>Este mes: <strong className="text-gray-800">{stats?.new_tenants_this_month ?? 0}</strong></span>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
                    ) : (
                        <BarChart data={stats?.registrations_last_30_days} />
                    )}
                </div>

                {/* Distribución de planes — 1 col */}
                <div className={`bg-white rounded-2xl p-6 ${SHADOW}`}>
                    <h2 className="text-sm font-semibold text-gray-900 mb-5">Distribución de planes</h2>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <PlanBar label="Free"     count={stats?.tenants_free     ?? 0} total={stats?.tenants_total ?? 1} color="#9ca3af" />
                            <PlanBar label="Pro"      count={stats?.tenants_pro      ?? 0} total={stats?.tenants_total ?? 1} color="#6366f1" />
                            <PlanBar label="Business" count={stats?.tenants_business ?? 0} total={stats?.tenants_total ?? 1} color="#7c3aed" />
                            <div className="pt-2 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">Waitlist</span>
                                    <span className="text-xs font-semibold text-gray-700 tabular-nums">{stats?.waitlist_total ?? 0}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actividad reciente global */}
            <div className={`bg-white rounded-2xl overflow-hidden ${SHADOW}`}>
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-900">Actividad reciente global</h2>
                    <Link to="/superadmin/activity" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                        Ver toda la actividad <ArrowRightIcon className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {!recentEvents.length ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                        <p className="text-sm text-gray-400">Sin actividad reciente.</p>
                    </div>
                ) : (
                    <ul>
                        {recentEvents.map((ev, idx) => {
                            const meta = EVENT_META[ev.type] ?? EVENT_META.created;
                            const { Icon, iconCls, iconBg, label } = meta;
                            return (
                                <li
                                    key={ev.id}
                                    className={`flex items-center gap-4 px-6 py-3.5 ${idx % 2 !== 0 ? 'bg-gray-50/50' : 'bg-white'}`}
                                >
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                                        <Icon className={`w-4 h-4 ${iconCls}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{ev.document_title ?? 'Documento eliminado'}</p>
                                        <p className="text-xs text-gray-500">{label}</p>
                                    </div>
                                    {ev.tenant_name && (
                                        <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                                            {ev.tenant_name}
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-400 shrink-0 tabular-nums">{timeAgo(ev.created_at)}</span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </Layout>
    );
}
