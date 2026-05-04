import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { useToast } from '../context/ToastContext';

export default function OwnerRoute({ children }) {
    const { isOwner } = usePermissions();
    const toast = useToast();

    useEffect(() => {
        if (!isOwner) {
            toast.error('No tienes permisos para acceder a esta página.');
        }
    }, []);

    return isOwner ? children : <Navigate to="/dashboard" replace />;
}
