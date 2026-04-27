import { useNavigate } from 'react-router-dom';

export default function ErrorPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="w-24 h-24 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-6">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 4L44 40H4L24 4z" fill="#fee2e2" stroke="#fca5a5" strokeWidth="2" strokeLinejoin="round" />
                    <line x1="24" y1="18" x2="24" y2="28" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="24" cy="34" r="1.5" fill="#ef4444" />
                </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">Algo ha ido mal</h1>
            <p className="mt-2 text-sm text-gray-500 text-center max-w-sm">
                Ha ocurrido un error inesperado. Estamos trabajando para solucionarlo.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 text-white font-semibold rounded-xl transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                    Recargar página
                </button>
                <button
                    onClick={() => navigate('/dashboard', { replace: true })}
                    className="px-6 py-2.5 text-indigo-700 font-semibold rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                    Volver al dashboard
                </button>
            </div>
        </div>
    );
}
