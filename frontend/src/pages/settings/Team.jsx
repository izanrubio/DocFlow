import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    UserGroupIcon,
    UserPlusIcon,
    TrashIcon,
    ArrowPathIcon,
    XMarkIcon,
    ShieldCheckIcon,
    PencilSquareIcon,
    EyeIcon,
    EnvelopeIcon,
} from '@heroicons/react/24/outline';
import Layout from '../../components/Layout';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import {
    getTeam,
    inviteMember,
    updateMemberRole,
    removeMember,
    resendInvitation,
    cancelInvitation,
} from '../../api/team';

const ROLES = [
    { value: 'admin',  label: 'Administrador', Icon: ShieldCheckIcon,  color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { value: 'editor', label: 'Editor',         Icon: PencilSquareIcon, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { value: 'viewer', label: 'Visor',           Icon: EyeIcon,         color: 'text-gray-600 bg-gray-100 border-gray-200' },
];

function RoleBadge({ role }) {
    const r = ROLES.find((x) => x.value === role) ?? ROLES[2];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${r.color}`}>
            <r.Icon className="w-3 h-3" />
            {r.label}
        </span>
    );
}

function daysUntil(isoDate) {
    const diff = Math.ceil((new Date(isoDate) - Date.now()) / 86400000);
    if (diff <= 0) return 'expirada';
    if (diff === 1) return '1 día';
    return `${diff} días`;
}

function InviteModal({ onClose }) {
    const [email, setEmail] = useState('');
    const [role, setRole]   = useState('editor');
    const { addToast }      = useToast();
    const queryClient       = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => inviteMember(email, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team'] });
            addToast('Invitación enviada.', 'success');
            onClose();
        },
        onError: (err) => addToast(err.response?.data?.message ?? 'Error al invitar.', 'error'),
    });

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Invitar miembro</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nombre@empresa.com"
                            autoFocus
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                        <div className="space-y-2">
                            {ROLES.map((r) => (
                                <label
                                    key={r.value}
                                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                        role === r.value ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value={r.value}
                                        checked={role === r.value}
                                        onChange={() => setRole(r.value)}
                                        className="mt-0.5 accent-indigo-600"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{r.label}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {r.value === 'admin'  && 'Acceso total: gestión de equipo, documentos y facturación.'}
                                            {r.value === 'editor' && 'Puede crear y gestionar documentos y plantillas.'}
                                            {r.value === 'viewer' && 'Solo puede ver documentos. No puede crear ni modificar.'}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={() => mutation.mutate()}
                        disabled={!email || mutation.isPending}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        {mutation.isPending ? 'Enviando…' : 'Enviar invitación'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Team() {
    const { user }                    = useAuth();
    const { addToast }                = useToast();
    const queryClient                 = useQueryClient();
    const [showInvite, setShowInvite] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['team'],
        queryFn:  () => getTeam().then((r) => r.data.data),
    });

    const members     = data?.members     ?? [];
    const invitations = data?.invitations ?? [];

    // Derive admin status from fresh API data (self member), fall back to stored user
    const selfMember = members.find((m) => m.is_self);
    const isAdmin    = (selfMember?.role ?? user?.role) === 'admin';

    const roleMutation = useMutation({
        mutationFn: ({ userId, role }) => updateMemberRole(userId, role),
        onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['team'] }); addToast('Rol actualizado.', 'success'); },
        onError:    (err) => addToast(err.response?.data?.message ?? 'Error.', 'error'),
    });

    const removeMutation = useMutation({
        mutationFn: (userId) => removeMember(userId),
        onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['team'] }); addToast('Miembro eliminado.', 'success'); },
        onError:    (err) => addToast(err.response?.data?.message ?? 'Error.', 'error'),
    });

    const resendMutation = useMutation({
        mutationFn: (id) => resendInvitation(id),
        onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['team'] }); addToast('Invitación reenviada.', 'success'); },
        onError:    (err) => addToast(err.response?.data?.message ?? 'Error.', 'error'),
    });

    const cancelMutation = useMutation({
        mutationFn: (id) => cancelInvitation(id),
        onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['team'] }); addToast('Invitación cancelada.', 'success'); },
        onError:    (err) => addToast(err.response?.data?.message ?? 'Error.', 'error'),
    });

    return (
        <Layout>
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Equipo</h1>
                        <p className="text-sm text-gray-500 mt-1">Gestiona los miembros de tu organización.</p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => setShowInvite(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <UserPlusIcon className="w-4 h-4" />
                            Invitar miembro
                        </button>
                    )}
                </div>

                {/* Members */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <UserGroupIcon className="w-4 h-4 text-gray-400" />
                            Miembros activos
                            {!isLoading && (
                                <span className="ml-1 text-xs font-normal text-gray-400">({members.length})</span>
                            )}
                        </h2>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {members.map((m) => (
                                <li key={m.id} className="flex items-center gap-4 px-6 py-4">
                                    {/* Avatar */}
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                                        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                                    >
                                        {m.name.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Name + email */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {m.name}
                                            {m.is_self && (
                                                <span className="ml-2 text-xs text-gray-400 font-normal">(tú)</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">{m.email}</p>
                                    </div>

                                    {/* Role — dropdown for admin on others, badge for self */}
                                    {isAdmin && !m.is_self ? (
                                        <select
                                            value={m.role}
                                            onChange={(e) => roleMutation.mutate({ userId: m.id, role: e.target.value })}
                                            disabled={roleMutation.isPending}
                                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:opacity-50 cursor-pointer"
                                        >
                                            {ROLES.map((r) => (
                                                <option key={r.value} value={r.value}>{r.label}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <RoleBadge role={m.role} />
                                    )}

                                    {/* Delete button — admins only, not self */}
                                    {isAdmin && !m.is_self && (
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`¿Eliminar a ${m.name} del equipo? Esta acción no se puede deshacer.`)) {
                                                    removeMutation.mutate(m.id);
                                                }
                                            }}
                                            disabled={removeMutation.isPending}
                                            className="shrink-0 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Eliminar miembro"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Pending invitations — always visible for admins */}
                {isAdmin && (
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                                Invitaciones pendientes
                                {invitations.length > 0 && (
                                    <span className="ml-1 text-xs font-normal text-gray-400">({invitations.length})</span>
                                )}
                            </h2>
                            <button
                                onClick={() => setShowInvite(true)}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                            >
                                + Nueva invitación
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : invitations.length === 0 ? (
                            <div className="px-6 py-10 text-center">
                                <EnvelopeIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-400">No hay invitaciones pendientes</p>
                                <p className="text-xs text-gray-300 mt-1">
                                    Las invitaciones enviadas aparecerán aquí hasta que sean aceptadas.
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {invitations.map((inv) => (
                                    <li key={inv.id} className="flex items-center gap-4 px-6 py-4">
                                        <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                                            <EnvelopeIcon className="w-4 h-4 text-amber-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{inv.email}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Enviada por {inv.invited_by} · expira en {daysUntil(inv.expires_at)}
                                            </p>
                                        </div>
                                        <RoleBadge role={inv.role} />
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => resendMutation.mutate(inv.id)}
                                                disabled={resendMutation.isPending}
                                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Reenviar invitación"
                                            >
                                                <ArrowPathIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => cancelMutation.mutate(inv.id)}
                                                disabled={cancelMutation.isPending}
                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Cancelar invitación"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

            </div>

            {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
        </Layout>
    );
}
