import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { me } from '../api/auth';

export default function AuthSync() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const setUser         = useAuthStore((s) => s.setUser);

    useEffect(() => {
        if (!isAuthenticated) return;
        me()
            .then((r) => setUser(r.data.data))
            .catch(() => {});
    }, [isAuthenticated, setUser]);

    return null;
}
