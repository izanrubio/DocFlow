import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Layout from '../../components/Layout';
import SuperAdminBanner from '../../components/SuperAdminBanner';
import { getSuperAdminUsers } from '../../api/superadmin';

const PLAN_META = {
    free:     { bg: '#f3f4f6', color: '#374151', label: 'Free' },
    pro:      { bg: '#eef2ff', color: '#4338ca', label: 'Pro' },
    business: { bg: '#f5f3ff', color: '#6d28d9', label: 'Business' },
};

const ROLE_META = {
    admin:  { bg: '#f5f3ff', color: '#6d28d9', label: 'Admin' },
    editor: { bg: '#dbeafe', color: '#1d4ed8', label: 'Editor' },
    viewer: { bg: '#f3f4f6', color: '#374151', label: 'Visor' },
};

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

export default function SuperAdminUsers() {
    const [search,     setSearch]     = useState('');
    const [role,       setRole]       = useState('');
    const [unverified, setUnverified] = useState(false);
    const [page,       setPage]       = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['superadmin-users', { search, role, unverified, page }],
        queryFn:  () => getSuperAdminUsers({
            search:     search     || undefined,
            role:       role       || undefined,
            unverified: unverified || undefined,
            page,
        }).then((r) => r.data.data),
        keepPreviousData: true,
    });

    const users      = data?.data ?? [];
    const total      = data?.total ?? 0;
    const totalPages = data ? Math.ceil(data.total / data.per_page) : 1;

    return (
        <Layout>
            <SuperAdminBanner />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
                    <p className="text-sm text-gray-500 mt-0.5">{total} usuarios en total</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3 mb-5">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Buscar por nombre o email…"
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={role}
                    onChange={(e) => { setRole(e.target.value); setPage(1); }}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                    <option value="">Todos los roles</option>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Visor</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={unverified}
                        onChange={(e) => { setUnverified(e.target.checked); setPage(1); }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Solo sin verificar
                </label>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_-4px_rgba(0,0,0,0.08)]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tenant</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Verificado</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Registrado</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Último acceso</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                [...Array(10)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6} className="px-5 py-3">
                                            <div className="h-4 bg-gray-100 rounded animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : !users.length ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <UserGroupIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                        <p className="text-sm text-gray-400">No se encontraron usuarios.</p>
                                    </td>
                                </tr>
                            ) : users.map((u) => {
                                const rm = ROLE_META[u.role] ?? ROLE_META.viewer;
                                const pm = u.tenant ? (PLAN_META[u.tenant.plan] ?? PLAN_META.free) : null;
                                return (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                                                    {(u.name?.[0] ?? '?').toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-800 truncate">{u.name}</p>
                                                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                                                </div>
                                                {u.is_owner && (
                                                    <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">OWNER</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {u.tenant ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-gray-700 text-xs">{u.tenant.name}</span>
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold" style={{ background: pm?.bg, color: pm?.color }}>
                                                        {pm?.label}
                                                    </span>
                                                </div>
                                            ) : <span className="text-gray-400 text-xs">—</span>}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: rm.bg, color: rm.color }}>
                                                {rm.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            {u.email_verified_at ? '✅' : '❌'}
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-gray-500">
                                            {new Date(u.created_at).toLocaleDateString('es-ES')}
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-gray-500">
                                            {timeAgo(u.last_activity)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Página {page} de {totalPages} · {total} usuarios</p>
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
