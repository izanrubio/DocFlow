import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import * as authApi from '../api/auth';

export default function VerifyEmail() {
    const navigate        = useNavigate();
    const { login }       = useAuth();
    const [params]        = useSearchParams();
    const [status, setStatus] = useState('verifying'); // verifying | success | error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const backendUrl = params.get('url');
        if (!backendUrl) {
            setStatus('error');
            setMessage('Enlace de verificación inválido.');
            return;
        }

        authApi.verifyEmailUrl(backendUrl)
            .then(({ data }) => {
                login(data.data.user, data.data.token);
                setStatus('success');
            })
            .catch((err) => {
                setStatus('error');
                setMessage(err.response?.data?.message ?? 'El enlace no es válido o ha expirado.');
            });
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">

                {status === 'verifying' && (
                    <>
                        <div className="w-14 h-14 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto mb-5" />
                        <h2 className="text-lg font-semibold text-gray-900">Verificando tu email…</h2>
                        <p className="text-sm text-gray-500 mt-2">Por favor espera un momento.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                            <CheckCircleIcon className="w-9 h-9 text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">¡Email verificado!</h2>
                        <p className="text-sm text-gray-500 mb-6">Tu cuenta está activa y lista para usar.</p>
                        <button
                            onClick={() => navigate('/dashboard', { replace: true })}
                            className="w-full py-2.5 px-4 text-white font-semibold rounded-xl transition-all hover:opacity-90"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                        >
                            Ir al dashboard →
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
                            <XCircleIcon className="w-9 h-9 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Enlace no válido</h2>
                        <p className="text-sm text-gray-500 mb-6">{message}</p>
                        <Link
                            to="/register"
                            className="block w-full py-2.5 px-4 text-center text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors"
                        >
                            Volver al registro
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
