import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
import Layout from '../../components/Layout';
import SuperAdminBanner from '../../components/SuperAdminBanner';
import { getSuperAdminTenants } from '../../api/superadmin';

const PLAN_META = {
    free:     { bg: '#f3f4f6', color: '#374151', label: 'Free' },
    pro:      { bg: '#eef2ff', color: '#4338ca', label: 'Pro' },
    business: { bg: '#f5f3ff', color: '#6d28d9', label: 'Business' },
};

const SUB_META = {
    active:   { bg: '#dcfce7', color: '#15803d', label: 'Activa' },
    trialing: { bg: '#dbeafe', color: '#1d4ed8', label: 'En prueba' },
    past_due: { bg: '#fef9c3', color: '#854d0e', label: 'Pago pendiente' },
    canceled: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelada' },
    paused:   { bg: '#f3f4f6', color: '#4b5563', label: 'Pausada' },
};

function PlanBadge({ plan }) {
    const m = PLAN_META[plan] ?? PLAN_META.free;
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: m.bg, color: m.color }}>
            {m.label}
        </span>
    );
}

function SubBadge({ status }) {
    if (!status) return <span className="text-gray-400 text-xs">—</span>;
    const m = SUB_META[status] ?? { bg: '#f3f4f6', color: '#374151', label: status };
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: m.bg, color: m.color }}>
            {m.label}
        </span>
    );
}

function timeAgo(iso) {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'hoy';
    if (days === 1) return 'ayer';
    if (days < 30)  return `hace ${days}d`;
    const months = Math.floor(days / 30);
    return `hace ${months} mes${months > 1 ? 'es' : ''}`;
}

export default function SuperAdminTenants() {
    const [search, setSearch] = useState('');
    const [plan,   setPlan]   = useState('');
    const [page,   setPage]   = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['superadmin-tenants', { search, plan, page }],
        queryFn:  () => getSuperAdminTenants({ search: search || undefined, plan: plan || undefined, page }).then((r) => r.data.data),
        keepPreviousData: true,
    });

    const tenants    = data?.data ?? [];
    const total      = data?.total ?? 0;
    const totalPages = data ? Math.ceil(data.total / data.per_page) : 1;

    return (
        <Layout>
            <SuperAdminBanner />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{total} tenants en total</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-3 mb-5">
                <div className="relative flex-1 max-w-sm">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Buscar por nombre o email del owner…"
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={plan}
                    onChange={(e) => { setPlan(e.target.value); setPage(1); }}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                    <option value="">Todos los planes</option>
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="business">Business</option>
                </select>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_-4px_rgba(0,0,0,0.08)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tenant</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Owner</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Suscripción</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuarios</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Documentos</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Registrado</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={8} className="px-5 py-3">
                                            <div className="h-4 bg-gray-100 rounded animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : !tenants.length ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-16 text-center">
                                        <BuildingOffice2Icon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                        <p className="text-sm text-gray-400">No se encontraron tenants.</p>
                                    </td>
                                </tr>
                            ) : tenants.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <p className="font-semibold text-gray-900">{t.name}</p>
                                        <p className="text-xs text-gray-400 font-mono">{t.slug}</p>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {t.owner ? (
                                            <>
                                                <p className="text-gray-700">{t.owner.name}</p>
                                                <p className="text-xs text-gray-400">{t.owner.email}</p>
                                            </>
                                        ) : <span className="text-gray-400">—</span>}
                                    </td>
                                    <td className="px-4 py-3.5"><PlanBadge plan={t.plan} /></td>
                                    <td className="px-4 py-3.5"><SubBadge status={t.subscription_status} /></td>
                                    <td className="px-4 py-3.5 text-right tabular-nums text-gray-700">{t.users_count}</td>
                                    <td className="px-4 py-3.5 text-right tabular-nums text-gray-700">
                                        <span className="text-emerald-600 font-semibold">{t.documents_completed_count}</span>
                                        <span className="text-gray-400">/{t.documents_count}</span>
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-gray-500">{timeAgo(t.created_at)}</td>
                                    <td className="px-5 py-3.5 text-right">
                                        <Link
                                            to={`/superadmin/tenants/${t.id}`}
                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                                        >
                                            Ver →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Página {page} de {totalPages} · {total} tenants</p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-xs border rounded-lg hover:bg-gray-50 disabled:opacity-40">
                                ← Anterior
                            </button>
                            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 text-xs border rounded-lg hover:bg-gray-50 disabled:opacity-40">
                                Siguiente →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
