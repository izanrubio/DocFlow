import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckBadgeIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Layout from '../../components/Layout';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import * as profileApi from '../../api/profile';
import * as authApi from '../../api/auth';

function Avatar({ name }) {
    const initials = (name ?? '?')
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
    return (
        <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
            {initials}
        </div>
    );
}

const PLAN_LABELS = { free: 'Gratuito', pro: 'Profesional', business: 'Business' };

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Profile() {
    const { user, setUser } = useAuth();
    const toast             = useToast();
    const navigate          = useNavigate();

    const [profile, setProfile]         = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const [infoForm, setInfoForm]   = useState({ name: '', email: '' });
    const [infoSaving, setInfoSaving] = useState(false);
    const [infoErrors, setInfoErrors] = useState({});

    const [pwForm, setPwForm]       = useState({ current_password: '', password: '', password_confirmation: '' });
    const [pwSaving, setPwSaving]   = useState(false);
    const [pwErrors, setPwErrors]   = useState({});
    const [pwFrontError, setPwFrontError] = useState('');

    const [resending, setResending] = useState(false);

    useEffect(() => {
        profileApi.getProfile()
            .then(({ data }) => {
                setProfile(data.data);
                setInfoForm({ name: data.data.name, email: data.data.email });
            })
            .finally(() => setLoadingProfile(false));
    }, []);

    const emailWillChange = profile && infoForm.email !== profile.email;

    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        setInfoErrors({});
        setInfoSaving(true);
        try {
            const { data } = await profileApi.updateProfile(infoForm);
            setProfile((p) => ({ ...p, ...data.data }));
            setUser({ ...user, name: data.data.name, email: data.data.email });
            toast.success(data.message);
            if (data.data.email_changed) {
                navigate('/verify-pending', { replace: true });
            }
        } catch (err) {
            if (err.response?.status === 422) {
                setInfoErrors(err.response.data.errors ?? {});
            } else {
                toast.error(err.response?.data?.message ?? 'Error al guardar.');
            }
        } finally {
            setInfoSaving(false);
        }
    };

    const handlePwSubmit = async (e) => {
        e.preventDefault();
        setPwErrors({});
        setPwFrontError('');

        if (pwForm.password.length < 8) {
            setPwFrontError('La nueva contraseña debe tener al menos 8 caracteres.');
            return;
        }
        if (pwForm.password !== pwForm.password_confirmation) {
            setPwFrontError('Las contraseñas no coinciden.');
            return;
        }

        setPwSaving(true);
        try {
            const { data } = await profileApi.updatePassword(pwForm);
            toast.success(data.message);
            setPwForm({ current_password: '', password: '', password_confirmation: '' });
        } catch (err) {
            if (err.response?.status === 422) {
                const serverErrors = err.response.data.errors ?? {};
                if (Object.keys(serverErrors).length) {
                    setPwErrors(serverErrors);
                } else {
                    setPwFrontError(err.response.data.message ?? 'Error al cambiar la contraseña.');
                }
            } else {
                toast.error(err.response?.data?.message ?? 'Error al cambiar la contraseña.');
            }
        } finally {
            setPwSaving(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await authApi.resendVerification(profile.email);
            toast.success('Email de verificación reenviado.');
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Error al reenviar.');
        } finally {
            setResending(false);
        }
    };

    const fieldErr = (errs, field) =>
        errs[field] ? <p className="mt-1 text-xs text-red-600">{errs[field][0]}</p> : null;

    const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
                </div>

                {loadingProfile ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-6">

                        {/* ── Información personal ── */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h2 className="text-base font-semibold text-gray-900 mb-5">Información personal</h2>

                            <div className="flex items-center gap-4 mb-6">
                                <Avatar name={profile?.name} />
                                <div>
                                    <p className="font-semibold text-gray-900">{profile?.name}</p>
                                    <p className="text-sm text-gray-400">{profile?.email}</p>
                                </div>
                            </div>

                            {emailWillChange && (
                                <div className="mb-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <ExclamationCircleIcon className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                    <p className="text-xs text-amber-700">
                                        Tendrás que verificar tu nuevo email antes de poder iniciar sesión.
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleInfoSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        value={infoForm.name}
                                        onChange={(e) => setInfoForm((f) => ({ ...f, name: e.target.value }))}
                                        className={inputCls}
                                        required
                                    />
                                    {fieldErr(infoErrors, 'name')}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={infoForm.email}
                                        onChange={(e) => setInfoForm((f) => ({ ...f, email: e.target.value }))}
                                        className={inputCls}
                                        required
                                    />
                                    {fieldErr(infoErrors, 'email')}
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={infoSaving}
                                        className="px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 transition-all hover:opacity-90"
                                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                                    >
                                        {infoSaving ? 'Guardando…' : 'Guardar cambios'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* ── Cambiar contraseña ── */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h2 className="text-base font-semibold text-gray-900 mb-5">Cambiar contraseña</h2>

                            <form onSubmit={handlePwSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
                                    <input
                                        type="password"
                                        value={pwForm.current_password}
                                        onChange={(e) => setPwForm((f) => ({ ...f, current_password: e.target.value }))}
                                        className={inputCls}
                                        required
                                        autoComplete="current-password"
                                    />
                                    {fieldErr(pwErrors, 'current_password')}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                                    <input
                                        type="password"
                                        value={pwForm.password}
                                        onChange={(e) => setPwForm((f) => ({ ...f, password: e.target.value }))}
                                        className={inputCls}
                                        required
                                        autoComplete="new-password"
                                        placeholder="Mínimo 8 caracteres"
                                    />
                                    {fieldErr(pwErrors, 'password')}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
                                    <input
                                        type="password"
                                        value={pwForm.password_confirmation}
                                        onChange={(e) => setPwForm((f) => ({ ...f, password_confirmation: e.target.value }))}
                                        className={inputCls}
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>

                                {pwFrontError && (
                                    <p className="text-xs text-red-600">{pwFrontError}</p>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={pwSaving}
                                        className="px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-50 transition-all hover:opacity-90"
                                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                                    >
                                        {pwSaving ? 'Cambiando…' : 'Cambiar contraseña'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* ── Información de la cuenta ── */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h2 className="text-base font-semibold text-gray-900 mb-5">Información de la cuenta</h2>

                            <dl className="space-y-4 text-sm">
                                <div className="flex items-center justify-between">
                                    <dt className="text-gray-500">Miembro desde</dt>
                                    <dd className="font-medium text-gray-900">{formatDate(profile?.created_at)}</dd>
                                </div>

                                <div className="flex items-center justify-between">
                                    <dt className="text-gray-500">Plan actual</dt>
                                    <dd>
                                        <Link
                                            to="/settings/billing"
                                            className="text-indigo-600 hover:underline font-medium"
                                        >
                                            {PLAN_LABELS[profile?.tenant?.plan] ?? profile?.tenant?.plan}
                                        </Link>
                                    </dd>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-gray-500">Email verificado</dt>
                                    <dd className="flex items-center gap-2">
                                        {profile?.email_verified_at ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                                <CheckBadgeIcon className="w-3.5 h-3.5" />
                                                Verificado
                                            </span>
                                        ) : (
                                            <>
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
                                                    Sin verificar
                                                </span>
                                                <button
                                                    onClick={handleResend}
                                                    disabled={resending}
                                                    className="text-xs text-indigo-600 hover:underline disabled:opacity-50"
                                                >
                                                    {resending ? 'Enviando…' : 'Reenviar verificación'}
                                                </button>
                                            </>
                                        )}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                    </div>
                )}
            </div>
        </Layout>
    );
}
