import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import * as authApi from '../api/auth';

const NAV = [
    { label: 'Dashboard',   href: '/dashboard', Icon: HomeIcon },
    { label: 'Documentos',  href: '/dashboard', Icon: DocumentTextIcon },
];

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate         = useNavigate();
    const { pathname }     = useLocation();

    const handleLogout = async () => {
        try { await authApi.logout(); } finally {
            logout();
            navigate('/login');
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-indigo-600">DocFlow</h1>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {NAV.map(({ label, href, Icon }) => {
                        const active = pathname === href || pathname.startsWith('/documents');
                        return (
                            <Link
                                key={label}
                                to={href}
                                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                                    ${active
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    <button
                        onClick={handleLogout}
                        className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-auto">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
