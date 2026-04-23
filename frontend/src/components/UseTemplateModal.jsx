import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTemplate } from '../api/templates';

export default function UseTemplateModal({ template, onClose }) {
    const navigate     = useNavigate();
    const queryClient  = useQueryClient();

    const [title, setTitle]         = useState(template.name);
    const [expiresAt, setExpiresAt] = useState('');
    const [errors, setErrors]       = useState({});

    const mutation = useMutation({
        mutationFn: () => useTemplate(template.id, { title, expires_at: expiresAt || undefined }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            onClose();
            navigate(`/documents/${res.data.data.id}`, {
                state: { successMessage: 'Documento creado. Ahora añade los firmantes.' },
            });
        },
        onError: (err) => {
            if (err.response?.status === 422) setErrors(err.response.data.errors ?? {});
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        mutation.mutate();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Crear documento</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Desde «{template.name}»</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título del documento</label>
                        <input
                            type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                            required maxLength={255}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha límite de firma <span className="text-gray-400 font-normal">(opcional)</span>
                        </label>
                        <input
                            type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                        {errors.expires_at && <p className="mt-1 text-xs text-red-600">{errors.expires_at[0]}</p>}
                    </div>

                    {mutation.isError && !Object.keys(errors).length && (
                        <p className="text-sm text-red-600">
                            {mutation.error?.response?.data?.message ?? 'Error al crear el documento.'}
                        </p>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} disabled={mutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={mutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {mutation.isPending ? 'Creando…' : 'Crear documento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
