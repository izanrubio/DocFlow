import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

const CONFIG = {
    success: { Icon: CheckCircleIcon,       wrap: 'bg-green-50  border-green-200  text-green-800',  icon: 'text-green-500'  },
    error:   { Icon: ExclamationCircleIcon,  wrap: 'bg-red-50    border-red-200    text-red-800',    icon: 'text-red-500'    },
    warning: { Icon: ExclamationTriangleIcon,wrap: 'bg-yellow-50 border-yellow-200 text-yellow-800', icon: 'text-yellow-500' },
    info:    { Icon: InformationCircleIcon,  wrap: 'bg-blue-50   border-blue-200   text-blue-800',   icon: 'text-blue-500'   },
};

function Toast({ toast, onRemove }) {
    const cfg = CONFIG[toast.type] ?? CONFIG.info;
    return (
        <div className={`animate-toast-in flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg w-80 max-w-[calc(100vw-2.5rem)] ${cfg.wrap}`}>
            <cfg.Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.icon}`} />
            <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
            <button
                onClick={() => onRemove(toast.id)}
                className="shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5"
                aria-label="Cerrar"
            >
                <XMarkIcon className="w-4 h-4" />
            </button>
        </div>
    );
}

export default function ToastContainer({ toasts, onRemove }) {
    if (!toasts.length) return null;
    return (
        <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <div key={t.id} className="pointer-events-auto">
                    <Toast toast={t} onRemove={onRemove} />
                </div>
            ))}
        </div>
    );
}
