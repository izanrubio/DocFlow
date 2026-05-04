import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeftIcon,
    BuildingOffice2Icon,
    UserGroupIcon,
    DocumentTextIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    PaperAirplaneIcon,
    PencilSquareIcon,
    EyeIcon,
    XCircleIcon,
    BellAlertIcon,
} from '@heroicons/react/24/outline';
import Layout from '../../components/Layout';
import SuperAdminBanner from '../../components/SuperAdminBanner';
import ConfirmModal from '../../components/ConfirmModal';
import { getSuperAdminTenant, changeTenantPlan } from '../../api/superadmin';
import { useToast } from '../../context/ToastContext';

const PLAN_META = {
    free:     { bg: '#f3f4f6', color: '#374151', label: 'Free' },
    pro:      { bg: '#eef2ff', color: '#4338ca', label: 'Pro' },
    business: { bg: '#f5f3ff', color: '#6d28d9', label: 'Business' },
};

const STATUS_META = {
    draft:       { bg: '#f3f4f6', color: '#374151', label: 'Borrador' },
    sent:        { bg: '#dbeafe', color: '#1d4ed8', label: 'Enviado' },
    in_progress: { bg: '#fef3c7', color: '#92400e', label: 'En proceso' },
    completed:   { bg: '#dcfce7', color: '#15803d', label: 'Completado' },
    expired:     { bg: '#ffedd5', color: '#9a3412', label: 'Expirado' },
    cancelled:   { bg: '#fee2e2', color: '#991b1b', label: 'Cancelado' },
};

const ROLE_META = {
    admin:  { bg: '#f5f3ff', color: '#6d28d9', label: 'Admin' },
    editor: { bg: '#dbeafe', color: '#1d4ed8', label: 'Editor' },
    viewer: { bg: '#f3f4f6', color: '#374151', label: 'Visor' },
};

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

const SHADOW = 'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_-4px_rgba(0,0,0,0.08)]';

function timeAgo(iso) {
    if (!iso) return 'Nunca';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'ahora mismo';
    if (mins < 60) return `hace ${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `hace ${hrs}h`;
    return `hace ${Math.floor(hrs / 24)}d`;
}

export default function TenantDetail() {
    const { id }   = useParams();
    const navigate = useNavigate();
    const toast    = useToast();
    const qc       = useQueryClient();

    const [pendingPlan,    setPendingPlan]    = useState(null);
    const [showPlanModal,  setShowPlanModal]  = useState(false);

    const { data: tenant, isLoading } = useQuery({
        queryKey: ['superadmin-tenant', id],
        queryFn:  () => getSuperAdminTenant(id).then((r) => r.data.data),
    });

    const planMutation = useMutation({
        mutationFn: (plan) => changeTenantPlan(id, plan),
        onSuccess: (res) => {
            toast.success(res.data.message);
            qc.invalidateQueries({ queryKey: ['superadmin-tenant', id] });
            qc.invalidateQueries({ queryKey: ['superadmin-tenants'] });
            setShowPlanModal(false);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message ?? 'Error al cambiar el plan.');
            setShowPlanModal(false);
        },
    });

    if (isLoading) {
        return (
            <Layout>
                <SuperAdminBanner />
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
                </div>
            </Layout>
        );
    }

    if (!tenant) return null;

    const planMeta = PLAN_META[tenant.plan] ?? PLAN_META.free;

    return (
        <Layout>
            <SuperAdminBanner />

            {/* Cabecera */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/superadmin/tenants')} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: planMeta.bg, color: planMeta.color }}>
                                {planMeta.label}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400 font-mono mt-0.5">{tenant.slug}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        onChange={(e) => { if (e.target.value) { setPendingPlan(e.target.value); setShowPlanModal(true); } }}
                        value=""
                        className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                        <option value="" disabled>Cambiar plan…</option>
                        {Object.entries(PLAN_META).map(([key, m]) => (
                            <option key={key} value={key} disabled={key === tenant.plan}>{m.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid de 4 métricas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { icon: UserGroupIcon,    iconBg: '#dbeafe', iconColor: 'text-blue-600',    label: 'Usuarios',        value: tenant.users_count },
                    { icon: DocumentTextIcon, iconBg: '#eef2ff', iconColor: 'text-indigo-600',  label: 'Docs completados',value: `${tenant.documents_completed_count}/${tenant.documents_count}` },
                    { icon: CheckCircleIcon,  iconBg: '#d1fae5', iconColor: 'text-emerald-600', label: 'Miembro desde',   value: new Date(tenant.created_at).toLocaleDateString('es-ES') },
                    { icon: BuildingOffice2Icon,iconBg:'#f5f3ff', iconColor: 'text-purple-600', label: 'Owner',           value: tenant.owner?.name ?? '—' },
                ].map(({ icon: Icon, iconBg, iconColor, label, value }) => (
                    <div key={label} className={`bg-white rounded-2xl p-5 ${SHADOW} flex items-center gap-4`}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                            <Icon className={`w-5 h-5 ${iconColor}`} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
                            <p className="text-lg font-bold text-gray-900 truncate">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* Miembros del equipo */}
                <div className={`bg-white rounded-2xl overflow-hidden ${SHADOW}`}>
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-900">Miembros del equipo</h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {tenant.users?.map((u) => {
                            const rm = ROLE_META[u.role] ?? ROLE_META.viewer;
                            return (
                                <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                                        {(u.name?.[0] ?? '?').toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: rm.bg, color: rm.color }}>{rm.label}</span>
                                        {u.email_verified_at
                                            ? <span className="text-emerald-500 text-xs" title="Email verificado">✅</span>
                                            : <span className="text-red-400 text-xs" title="Sin verificar">❌</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Historial de actividad */}
                <div className={`bg-white rounded-2xl overflow-hidden ${SHADOW}`}>
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-900">Actividad reciente</h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {!tenant.recent_events?.length ? (
                            <p className="text-sm text-gray-400 px-5 py-8 text-center">Sin actividad.</p>
                        ) : tenant.recent_events.map((ev) => {
                            const meta = EVENT_META[ev.type] ?? EVENT_META.created;
                            const { Icon, iconCls, iconBg, label } = meta;
                            return (
                                <div key={ev.id} className="flex items-center gap-3 px-5 py-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                                        <Icon className={`w-4 h-4 ${iconCls}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{ev.document_title ?? '—'}</p>
                                        <p className="text-xs text-gray-400">{label}</p>
                                    </div>
                                    <span className="text-xs text-gray-400 shrink-0">{timeAgo(ev.created_at)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Últimos documentos */}
            <div className={`bg-white rounded-2xl overflow-hidden ${SHADOW}`}>
                <div className="px-5 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900">Últimos documentos</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Título</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Estado</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Firmantes</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Fecha</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {!tenant.recent_documents?.length ? (
                                <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">Sin documentos.</td></tr>
                            ) : tenant.recent_documents.map((doc) => {
                                const sm = STATUS_META[doc.status] ?? STATUS_META.draft;
                                return (
                                    <tr key={doc.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-3 text-gray-800 font-medium">{doc.title}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: sm.bg, color: sm.color }}>
                                                {sm.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums text-gray-500 text-xs">
                                            <span className="text-emerald-600 font-semibold">{doc.signers_signed}</span>/{doc.signers_total}
                                        </td>
                                        <td className="px-5 py-3 text-xs text-gray-400">
                                            {new Date(doc.created_at).toLocaleDateString('es-ES')}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal
                open={showPlanModal}
                title="Cambiar plan"
                message={`¿Cambiar el plan de "${tenant.name}" a ${PLAN_META[pendingPlan]?.label ?? pendingPlan}? Esto no pasará por Stripe.`}
                confirmLabel="Sí, cambiar"
                loading={planMutation.isPending}
                onConfirm={() => planMutation.mutate(pendingPlan)}
                onCancel={() => setShowPlanModal(false)}
            />
        </Layout>
    );
}
