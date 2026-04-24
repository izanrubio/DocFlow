import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ConfirmModal({
    open,
    title,
    message,
    confirmLabel = 'Confirmar',
    confirmClass  = 'bg-red-600 text-white hover:bg-red-700',
    onConfirm,
    onCancel,
    loading = false,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
                <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
                            {message && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{message}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className={`px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 transition-colors ${confirmClass}`}
                        >
                            {loading ? 'Procesando…' : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
