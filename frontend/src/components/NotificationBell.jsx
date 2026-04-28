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
    if (seconds < 60)   return 'ahora mismo';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)   return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)     return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
}

const TYPE_ICON = {
    document_signed:    <CheckCircleIcon   className="w-5 h-5 text-green-500" />,
    document_completed: <CheckCircleSolid  className="w-5 h-5 text-green-600" />,
    document_rejected:  <XCircleIcon       className="w-5 h-5 text-red-500" />,
    document_expired:   <ClockIcon         className="w-5 h-5 text-orange-500" />,
    signer_reminder:    <BellIcon          className="w-5 h-5 text-blue-500" />,
    plan_limit_warning: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />,
};

export default function NotificationBell() {
    const [open, setOpen]       = useState(false);
    const ref                   = useRef(null);
    const navigate              = useNavigate();
    const queryClient           = useQueryClient();

    const { data: countData } = useQuery({
        queryKey: ['notifications-unread-count'],
        queryFn:  () => getUnreadCount().then((r) => r.data.data),
        refetchInterval: 30000,
    });

    const { data: listData, isLoading: listLoading } = useQuery({
        queryKey: ['notifications-list'],
        queryFn:  () => getNotifications().then((r) => r.data.data),
        enabled:  open,
    });

    const readMutation = useMutation({
        mutationFn: (id) => markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
        },
    });

    const readAllMutation = useMutation({
        mutationFn: markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteNotification(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
        },
    });

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const unreadCount = countData?.count ?? 0;
    const notifications = listData ?? [];

    const handleClick = (n) => {
        if (!n.read_at) readMutation.mutate(n.id);
        const docId = n.data?.document_id;
        if (docId) {
            navigate(`/documents/${docId}`);
            setOpen(false);
        }
    };

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Notificaciones"
            >
                <BellIcon className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 flex flex-col max-h-[480px]">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                        <span className="text-sm font-semibold text-gray-800">Notificaciones</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => readAllMutation.mutate()}
                                disabled={readAllMutation.isPending}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
                            >
                                Marcar todas como leídas
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {listLoading ? (
                            <div className="flex items-center justify-center py-10">
                                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-10 text-center">
                                <BellIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">No tienes notificaciones nuevas</p>
                            </div>
                        ) : (
                            <ul>
                                {notifications.map((n) => (
                                    <li
                                        key={n.id}
                                        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors ${
                                            !n.read_at ? 'bg-indigo-50/50' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <button
                                            className="flex items-start gap-3 flex-1 text-left min-w-0"
                                            onClick={() => handleClick(n)}
                                        >
                                            <div className="shrink-0 mt-0.5">
                                                {TYPE_ICON[n.type] ?? <BellIcon className="w-5 h-5 text-gray-400" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm leading-snug truncate ${!n.read_at ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                    {n.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-snug">
                                                    {n.message}
                                                </p>
                                                <p className="text-[11px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => deleteMutation.mutate(n.id)}
                                            className="shrink-0 mt-0.5 text-gray-300 hover:text-gray-500 transition-colors"
                                            aria-label="Eliminar"
                                        >
                                            <XMarkIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="px-4 py-2.5 border-t border-gray-100 shrink-0">
                        <p className="text-xs text-gray-400 text-center">Últimas 20 notificaciones</p>
                    </div>
                </div>
            )}
        </div>
    );
}
