import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import * as authApi from '../api/auth';
import { useAuth } from '../hooks/useAuth';

export default function VerifyPending() {
    const { user }        = useAuth();
    const email           = user?.email ?? (() => { try { return localStorage.getItem('pending_verify_email'); } catch { return ''; } })();
    const [cooldown, setCooldown] = useState(0);
    const [sending, setSending]   = useState(false);
    const [sent, setSent]         = useState(false);
    const [error, setError]       = useState('');

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const handleResend = async () => {
        setError('');
        setSending(true);
        try {
            await authApi.resendVerification(email);
            setSent(true);
            setCooldown(60);
        } catch (err) {
            setError(err.response?.data?.message ?? 'Error al reenviar el email.');
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

                <h2 className="text-xl font-bold text-gray-900 mb-2">Verifica tu email</h2>
                <p className="text-sm text-gray-500 mb-1">
                    Para acceder a DocFlow necesitas verificar tu dirección de email.
                </p>
                {email && (
                    <p className="text-sm font-semibold text-indigo-600 mb-6">{email}</p>
                )}
                {!email && <div className="mb-6" />}

                <p className="text-sm text-gray-500 mb-6">
                    Revisa tu bandeja de entrada y la carpeta de spam.
                </p>

                {sent && (
                    <p className="text-xs text-green-600 font-medium mb-3">Email reenviado correctamente.</p>
                )}
                {error && (
                    <p className="text-xs text-red-600 mb-3">{error}</p>
                )}

                <button
                    onClick={handleResend}
                    disabled={sending || cooldown > 0}
                    className="w-full py-2.5 px-4 text-white font-semibold rounded-xl mb-3 disabled:opacity-50 transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                    {sending
                        ? 'Enviando…'
                        : cooldown > 0
                        ? `Reenviar en ${cooldown}s`
                        : 'Reenviar email de verificación'}
                </button>

                <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                    Volver al inicio de sesión
                </Link>
            </div>
        </div>
    );
}
