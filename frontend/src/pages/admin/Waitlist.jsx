import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    UsersIcon,
    CalendarDaysIcon,
    ArrowDownTrayIcon,
    RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import Layout from '../../components/Layout';
import ConfirmModal from '../../components/ConfirmModal';
import { getWaitlistAdmin, getWaitlistStats, launchWaitlist } from '../../api/waitlist';
import { useToast } from '../../context/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';

function StatCard({ label, value, icon: Icon, color = 'indigo' }) {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-600',
        green:  'bg-green-50 text-green-600',
        blue:   'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
    };
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <p className="text-sm text-gray-500">{label}</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 tabular-nums">{value ?? '—'}</p>
        </div>
    );
}

function exportCSV(entries) {
    const header = 'Nombre,Email,Fuente,Fecha';
    const rows   = entries.map((e) =>
        [
            `"${(e.name ?? '').replace(/"/g, '""')}"`,
            `"${e.email}"`,
            `"${e.source ?? ''}"`,
            `"${new Date(e.created_at).toLocaleString('es-ES')}"`,
        ].join(',')
    );
    const csv  = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export default function AdminWaitlist() {
    const { isOwner, isAdmin } = usePermissions();
    const toast                = useToast();
    const [page, setPage]      = useState(1);
    const [showLaunch, setShowLaunch] = useState(false);

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['waitlist-stats'],
        queryFn:  () => getWaitlistStats().then((r) => r.data.data),
        enabled:  isAdmin,
    });

    const { data: list, isLoading: listLoading } = useQuery({
        queryKey: ['waitlist-list', page],
        queryFn:  () => getWaitlistAdmin(page).then((r) => r.data),
        enabled:  isAdmin,
        keepPreviousData: true,
    });

    const launchMutation = useMutation({
        mutationFn: launchWaitlist,
        onSuccess:  (res) => {
            toast.success(`Enviando emails a ${res.data.data.total_emails} personas.`);
            setShowLaunch(false);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message ?? 'No se pudo lanzar.');
            setShowLaunch(false);
        },
    });

    if (!isAdmin) {
        return (
            <Layout>
                <div className="text-center py-20">
                    <p className="text-gray-500">Solo los administradores pueden ver la waitlist.</p>
                </div>
            </Layout>
        );
    }

    const entries   = list?.data ?? [];
    const totalPages = list ? Math.ceil(list.total / list.per_page) : 1;

    return (
        <Layout>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Lista de espera</h1>
                        <p className="text-sm text-gray-500 mt-1">Emails recogidos antes del lanzamiento.</p>
                    </div>
                    <button
                        onClick={() => exportCSV(entries)}
                        disabled={entries.length === 0}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
                    >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Exportar CSV
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statsLoading ? (
                        [...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)
                    ) : (
                        <>
                            <StatCard label="Total"        value={stats?.total}     icon={UsersIcon}       color="indigo" />
                            <StatCard label="Hoy"          value={stats?.today}     icon={CalendarDaysIcon} color="green" />
                            <StatCard label="Esta semana"  value={stats?.this_week} icon={CalendarDaysIcon} color="blue" />
                            <div className="bg-white rounded-xl border border-gray-200 p-5">
                                <p className="text-sm text-gray-500 mb-3">Por fuente</p>
                                {stats?.by_source && Object.entries(stats.by_source).length > 0 ? (
                                    <div className="space-y-1.5">
                                        {Object.entries(stats.by_source).map(([src, cnt]) => (
                                            <div key={src} className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600 capitalize">{src}</span>
                                                <span className="text-xs font-bold text-gray-900 tabular-nums">{cnt}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400">Sin datos</p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Nombre</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Email</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Fuente</th>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {listLoading ? (
                                    [...Array(8)].map((_, i) => (
                                        <tr key={i}><td colSpan={4} className="px-5 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                                    ))
                                ) : entries.length === 0 ? (
                                    <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400 text-sm">Nadie en la lista todavía</td></tr>
                                ) : entries.map((e) => (
                                    <tr key={e.id} className="hover:bg-gray-50">
                                        <td className="px-5 py-3 text-gray-700">{e.name ?? <span className="text-gray-400 italic">—</span>}</td>
                                        <td className="px-5 py-3 text-gray-800 font-mono text-xs">{e.email}</td>
                                        <td className="px-5 py-3">
                                            {e.source ? (
                                                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium capitalize">{e.source}</span>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-gray-500 text-xs">{new Date(e.created_at).toLocaleString('es-ES')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500">Página {page} de {totalPages} · {list?.total} entradas</p>
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

                {/* Launch section — owner only */}
                {isOwner && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                                <RocketLaunchIcon className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-base font-semibold text-gray-900 mb-1">Email de lanzamiento</h2>
                                <p className="text-sm text-gray-500 mb-4">
                                    Envía el email de lanzamiento a todos los emails de la lista.
                                    Esta acción no se puede deshacer y solo puede ejecutarse una vez.
                                </p>
                                <button
                                    onClick={() => setShowLaunch(true)}
                                    disabled={launchMutation.isPending}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    <RocketLaunchIcon className="w-4 h-4" />
                                    Enviar email de lanzamiento a todos
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                open={showLaunch}
                title="Enviar email de lanzamiento"
                message={`¿Estás seguro? Se enviará un email a ${stats?.total ?? '?'} personas. Esta acción no se puede deshacer.`}
                confirmLabel="Sí, lanzar"
                loading={launchMutation.isPending}
                onConfirm={() => launchMutation.mutate()}
                onCancel={() => setShowLaunch(false)}
            />
        </Layout>
    );
}
