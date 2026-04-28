import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    BellIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from '../api/notifications';

function timeAgo(iso) {
    const seconds = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (seconds < 60)  return 'ahora mismo';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)  return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)    return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
}

const TYPE_ICON = {
    document_signed:    <CheckCircleIcon        className="w-5 h-5 text-green-500 shrink-0" />,
    document_completed: <CheckCircleSolid       className="w-5 h-5 text-green-600 shrink-0" />,
    document_rejected:  <XCircleIcon            className="w-5 h-5 text-red-500 shrink-0" />,
    document_expired:   <ClockIcon              className="w-5 h-5 text-orange-500 shrink-0" />,
    signer_reminder:    <BellIcon               className="w-5 h-5 text-blue-500 shrink-0" />,
    plan_limit_warning: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 shrink-0" />,
};

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const ref             = useRef(null);
    const navigate        = useNavigate();
    const queryClient     = useQueryClient();

    const { data: countData } = useQuery({
        queryKey:        ['notifications-unread-count'],
        queryFn:         () => getUnreadCount().then((r) => r.data.data),
        refetchInterval: 30000,
    });

    const { data: listData, isLoading: listLoading } = useQuery({
        queryKey: ['notifications-list'],
        queryFn:  () => getNotifications().then((r) => r.data.data),
        enabled:  open,
    });

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
    };

    const readMutation    = useMutation({ mutationFn: (id) => markAsRead(id),        onSuccess: invalidate });
    const readAllMutation = useMutation({ mutationFn: markAllAsRead,                 onSuccess: invalidate });
    const deleteMutation  = useMutation({ mutationFn: (id) => deleteNotification(id), onSuccess: invalidate });

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const unreadCount   = countData?.count ?? 0;
    const notifications = listData ?? [];

    const handleClick = (n) => {
        if (!n.read_at) readMutation.mutate(n.id);
        setOpen(false);
        const docId = n.data?.document_id;
        if (docId) navigate(`/documents/${docId}`);
    };

    return (
        <div ref={ref} className="relative">
            {/* Bell button */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Notificaciones"
            >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel — right-0 aligns right edge with bell, top-full opens downward */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 flex flex-col max-h-[480px]">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-t-xl border-b border-gray-200 shrink-0">
                        <span className="text-sm font-bold text-gray-800">Notificaciones</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => readAllMutation.mutate()}
                                disabled={readAllMutation.isPending}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 transition-colors"
                            >
                                Marcar todas leídas
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto flex-1">
                        {listLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-12 text-center px-4">
                                <BellIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-400">No tienes notificaciones nuevas</p>
                                <p className="text-xs text-gray-300 mt-1">Te avisaremos cuando haya novedades</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {notifications.map((n) => (
                                    <li
                                        key={n.id}
                                        className={`flex items-start gap-3 px-4 py-4 transition-colors group ${
                                            !n.read_at
                                                ? 'bg-blue-50/40 hover:bg-blue-50/70'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        {/* Unread dot */}
                                        <div className="shrink-0 mt-1 flex flex-col items-center gap-1">
                                            {TYPE_ICON[n.type] ?? <BellIcon className="w-5 h-5 text-gray-400 shrink-0" />}
                                            {!n.read_at && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <button
                                            className="flex-1 text-left min-w-0"
                                            onClick={() => handleClick(n)}
                                        >
                                            <p className={`text-sm leading-snug ${
                                                !n.read_at
                                                    ? 'font-semibold text-gray-900'
                                                    : 'font-medium text-gray-700'
                                            }`}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                                {n.message}
                                            </p>
                                            <p className="text-[11px] text-gray-400 mt-1.5">{timeAgo(n.created_at)}</p>
                                        </button>

                                        {/* Delete */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(n.id); }}
                                            className="shrink-0 mt-0.5 text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all"
                                            aria-label="Eliminar notificación"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 rounded-b-xl shrink-0">
                        <p className="text-xs text-gray-400 text-center">Últimas 20 notificaciones</p>
                    </div>
                </div>
            )}
        </div>
    );
}
