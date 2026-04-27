import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ToastContainer from '../components/ToastContainer';
import { setToastBridge } from '../utils/toastBridge';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const remove = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const add = useCallback((type, message, duration = 4000) => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts((prev) => [...prev, { id, type, message }]);
        if (duration > 0) {
            setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
        }
    }, []);

    const toast = useMemo(() => ({
        success: (msg, dur) => add('success', msg, dur),
        error:   (msg, dur) => add('error',   msg, dur),
        warning: (msg, dur) => add('warning', msg, dur),
        info:    (msg, dur) => add('info',    msg, dur),
    }), [add]);

    useEffect(() => {
        setToastBridge(toast);
        return () => setToastBridge(null);
    }, [toast]);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} onRemove={remove} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
