import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { acceptInvitation } from '../api/team';
import { useAuthStore } from '../store/authStore';

export default function AcceptInvitation() {
    const { token }    = useParams();
    const navigate     = useNavigate();
    const login        = useAuthStore((s) => s.login);

    const [name, setName]           = useState('');
    const [password, setPassword]   = useState('');
    const [confirm, setConfirm]     = useState('');
    const [error, setError]         = useState(null);

    const mutation = useMutation({
        mutationFn: () => acceptInvitation(token, name, password, confirm),
        onSuccess: (res) => {
            const { token: authToken, user } = res.data.data;
            login(user, authToken);
            navigate('/dashboard');
        },
        onError: (err) => {
            const msg = err.response?.data?.message ?? 'Error al aceptar la invitación.';
            const errors = err.response?.data?.errors;
            if (errors) {
                setError(Object.values(errors).flat().join(' '));
            } else {
                setError(msg);
            }
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        if (password !== confirm) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        mutation.mutate();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-indigo-600 mb-2">DocFlow</h1>
                    <p className="text-gray-500 text-sm">Firma electrónica de documentos</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Acepta tu invitación</h2>
                    <p className="text-sm text-gray-500 mb-6">Crea tu cuenta para unirte al equipo.</p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="María García"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                placeholder="Mínimo 8 caracteres"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                            <input
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                                placeholder="Repite la contraseña"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm"
                        >
                            {mutation.isPending ? 'Creando cuenta…' : 'Crear cuenta y unirme'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
