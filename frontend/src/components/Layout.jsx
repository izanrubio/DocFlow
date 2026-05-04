import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    HomeIcon,
    DocumentTextIcon,
    RectangleStackIcon,
    CreditCardIcon,
    UserCircleIcon,
    UserGroupIcon,
    CodeBracketIcon,
    ClipboardDocumentListIcon,
    ArrowRightStartOnRectangleIcon,
    ChevronUpDownIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import * as authApi from '../api/auth';
import NotificationBell from './NotificationBell';

const NAV = [
    { label: 'Dashboard',   href: '/dashboard',        Icon: HomeIcon,           match: (p) => p === '/dashboard' },
    { label: 'Documentos',  href: '/documents',        Icon: DocumentTextIcon,   match: (p) => p === '/documents' || p.startsWith('/documents/') },
    { label: 'Plantillas',  href: '/templates',        Icon: RectangleStackIcon, match: (p) => p === '/templates' },
    { label: 'Equipo',      href: '/settings/team',    Icon: UserGroupIcon,      match: (p) => p === '/settings/team' },
    { label: 'Facturación', href: '/settings/billing', Icon: CreditCardIcon,     match: (p) => p === '/settings/billing' },
];

const ROLE_LABELS = { admin: 'Admin', editor: 'Editor', viewer: 'Visor' };
const ROLE_COLORS = {
    admin:  'text-purple-700 bg-purple-50',
    editor: 'text-blue-700 bg-blue-50',
    viewer: 'text-gray-600 bg-gray-100',
};

function UserMenu({ user, onLogout, isAdmin }) {
    const [open, setOpen] = useState(false);
    const ref             = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const initials = (user?.name ?? '?')
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');

    return (
        <div ref={ref} className="relative p-4 border-t border-gray-200">
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    {user?.role && (
                        <span className={`mt-0.5 inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ROLE_COLORS[user.role] ?? ROLE_COLORS.viewer}`}>
                            {ROLE_LABELS[user.role] ?? user.role}
                        </span>
                    )}
                </div>
                <ChevronUpDownIcon className="w-4 h-4 text-gray-400 shrink-0" />
            </button>

            {open && (
                <div className="absolute bottom-full left-3 right-3 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                    <Link
                        to="/settings/profile"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <UserCircleIcon className="w-4 h-4 text-gray-400" />
                        Mi perfil
                    </Link>
                    <Link
                        to="/settings/team"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <UserGroupIcon className="w-4 h-4 text-gray-400" />
                        Equipo
                    </Link>
                    <Link
                        to="/settings/billing"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <CreditCardIcon className="w-4 h-4 text-gray-400" />
                        Facturación
                    </Link>
                    {isAdmin && (
                        <Link
                            to="/settings/developer"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <CodeBracketIcon className="w-4 h-4 text-gray-400" />
                            API & Desarrolladores
                        </Link>
                    )}
                    <div className="border-t border-gray-100 my-1" />
                    <button
                        onClick={() => { setOpen(false); onLogout(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                        Cerrar sesión
                    </button>
                </div>
            )}
        </div>
    );
}

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const { isAdmin, isOwner } = usePermissions();
    const navigate         = useNavigate();
    const { pathname }     = useLocation();

    const handleLogout = async () => {
        try { await authApi.logout(); } finally {
            logout();
            navigate('/login');
        }
    };

    const allNav = [
        ...NAV,
        ...(isAdmin  ? [{ label: 'API & Dev',     href: '/settings/developer', Icon: CodeBracketIcon,          match: (p) => p === '/settings/developer' }] : []),
        ...(isOwner  ? [{ label: 'Admin Waitlist', href: '/admin/waitlist',     Icon: ClipboardDocumentListIcon, match: (p) => p === '/admin/waitlist' }] : []),
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-indigo-600">DocFlow</h1>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {allNav.map(({ label, href, Icon, match }) => {
                        const active = match(pathname);
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
                <UserMenu user={user} onLogout={handleLogout} isAdmin={isAdmin} />
            </aside>

            {/* main: flex-col, NO overflow here — only the content div scrolls */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-14 shrink-0 bg-white border-b border-gray-200 px-8 flex items-center justify-end">
                    <NotificationBell />
                </header>

                <div className="flex-1 overflow-auto p-8">{children}</div>

                <footer className="shrink-0 border-t border-gray-200 px-8 py-3 flex items-center gap-4">
                    <Link to="/privacy" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                        Privacidad
                    </Link>
                    <Link to="/terms" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                        Términos
                    </Link>
                    <span className="text-xs text-gray-300">© 2026 DocFlow</span>
                </footer>
            </main>
        </div>
    );
}
