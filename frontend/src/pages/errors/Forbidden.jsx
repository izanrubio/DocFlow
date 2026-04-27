import { useNavigate } from 'react-router-dom';

export default function Forbidden() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="w-24 h-24 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-6">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="20" fill="#fef3c7" stroke="#fcd34d" strokeWidth="2" />
                    <rect x="16" y="21" width="16" height="13" rx="2" fill="#f59e0b" />
                    <path d="M18 21v-4a6 6 0 0 1 12 0v4" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <circle cx="24" cy="27" r="1.5" fill="white" />
                    <line x1="24" y1="28.5" x2="24" y2="31" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </div>

            <p className="text-7xl font-black text-amber-500 leading-none tracking-tight">403</p>
            <h1 className="mt-3 text-2xl font-bold text-gray-900">Acceso denegado</h1>
            <p className="mt-2 text-sm text-gray-500 text-center max-w-sm">
                No tienes permiso para ver este contenido.
            </p>

            <button
                onClick={() => navigate('/dashboard', { replace: true })}
                className="mt-8 px-6 py-2.5 text-white font-semibold rounded-xl transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
                Volver al dashboard
            </button>
        </div>
    );
}
