import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import * as authApi from '../api/auth';

function EmailSentScreen({ email }) {
    const [cooldown, setCooldown] = useState(0);
    const [sending, setSending]   = useState(false);
    const [sent, setSent]         = useState(false);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const handleResend = async () => {
        setSending(true);
        try {
            await authApi.resendVerification();
            setSent(true);
            setCooldown(60);
        } catch {
            // silently ignore — user not authenticated yet, but resend works server-side
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: '#eef2ff' }}
                >
                    <EnvelopeIcon className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Revisa tu bandeja de entrada</h2>
                <p className="text-sm text-gray-600 mb-1">
                    Hemos enviado un enlace de verificación a:
                </p>
                <p className="text-sm font-semibold text-indigo-600 mb-6">{email}</p>
                <p className="text-sm text-gray-500 mb-6">
                    Haz clic en el enlace del email para activar tu cuenta.
                    Si no lo ves, revisa la carpeta de spam.
                </p>

                {sent && (
                    <p className="text-xs text-green-600 font-medium mb-3">Email reenviado correctamente.</p>
                )}

                <button
                    onClick={handleResend}
                    disabled={sending || cooldown > 0}
                    className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors mb-3"
                >
                    {sending
                        ? 'Enviando…'
                        : cooldown > 0
                        ? `Reenviar en ${cooldown}s`
                        : 'Reenviar email'}
                </button>

                <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
}

export default function Register() {
    const [form, setForm]     = useState({ name: '', email: '', password: '', password_confirmation: '' });
    const [error, setError]   = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [registered, setRegistered] = useState(null); // email string when done

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setErrors({});
        setLoading(true);
        try {
            const { data } = await authApi.register(form);
            setRegistered(data.data.email ?? form.email);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setError(err.response?.data?.message || 'Error al registrarse');
            }
        } finally {
            setLoading(false);
        }
    };

    if (registered) return <EmailSentScreen email={registered} />;

    const fieldError = (field) =>
        errors[field] ? (
            <p className="mt-1 text-xs text-red-600">{errors[field][0]}</p>
        ) : null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear cuenta</h2>
                <p className="text-sm text-gray-500 mb-6">Empieza gratis con DocFlow</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            type="text" name="name" value={form.name} onChange={handleChange} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Tu nombre o empresa"
                        />
                        {fieldError('name')}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email" name="email" value={form.email} onChange={handleChange} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="tu@empresa.com"
                        />
                        {fieldError('email')}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input
                            type="password" name="password" value={form.password} onChange={handleChange} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Mínimo 8 caracteres"
                        />
                        {fieldError('password')}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                        <input
                            type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange} required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Repite la contraseña"
                        />
                    </div>
                    <button
                        type="submit" disabled={loading}
                        className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                    >
                        {loading ? 'Creando cuenta…' : 'Crear cuenta'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                        Inicia sesión
                    </Link>
                </p>
                <p className="mt-2 text-center">
                    <Link to="/pricing" className="text-xs text-gray-400 hover:text-gray-600">
                        Ver planes y precios
                    </Link>
                </p>
            </div>
        </div>
    );
}
