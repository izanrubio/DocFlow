import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function DocWithQuestionSVG() {
    return (
        <svg width="120" height="140" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="10" width="80" height="100" rx="8" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="2" />
            <rect x="10" y="10" width="80" height="100" rx="8" fill="#eef2ff" />
            <path d="M10 18a8 8 0 0 1 8-8h44l18 18v82a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8V18z" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="2" />
            <path d="M62 10v18h18" stroke="#c7d2fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="25" y1="50" x2="55" y2="50" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="25" y1="62" x2="65" y2="62" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="25" y1="74" x2="45" y2="74" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="88" cy="108" r="22" fill="#6366f1" />
            <text x="88" y="115" textAnchor="middle" fontSize="24" fontWeight="bold" fill="white" fontFamily="sans-serif">?</text>
        </svg>
    );
}

export default function NotFound() {
    const navigate = useNavigate();
    const { token } = useAuth();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <DocWithQuestionSVG />

            <p className="mt-8 text-8xl font-black text-indigo-600 leading-none tracking-tight">404</p>
            <h1 className="mt-3 text-2xl font-bold text-gray-900">Página no encontrada</h1>
            <p className="mt-2 text-sm text-gray-500 text-center max-w-sm">
                La página que buscas no existe o ha sido movida.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                    onClick={() => navigate(token ? '/dashboard' : '/', { replace: true })}
                    className="px-6 py-2.5 text-white font-semibold rounded-xl transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                    Volver al inicio
                </button>
                {token && (
                    <button
                        onClick={() => navigate('/dashboard', { replace: true })}
                        className="px-6 py-2.5 text-indigo-700 font-semibold rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                    >
                        Ir al dashboard
                    </button>
                )}
            </div>
        </div>
    );
}
