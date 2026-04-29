import { useAuthStore } from '../store/authStore';

function normalizeRole(rawRole) {
    if (!rawRole) return null;
    // Handles both string 'viewer' and enum object {value: 'viewer', ...}
    if (typeof rawRole === 'object' && rawRole.value) return rawRole.value;
    return String(rawRole);
}

export function usePermissions() {
    const user = useAuthStore((s) => s.user);
    const role = normalizeRole(user?.role);

    // If role is unknown/missing, default to most restrictive (viewer)
    const isViewer = !role || role === 'viewer';
    const isEditor = role === 'editor';
    const isAdmin  = role === 'admin';

    const canCreate = isAdmin || isEditor;
    const canEdit   = isAdmin || isEditor;
    const canDelete = isAdmin || isEditor;

    const noPermMsg = 'No tienes permisos para realizar esta acción. Contacta con tu administrador.';

    if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.debug('[usePermissions] raw role:', user?.role, '→ normalized:', role, '→ isViewer:', isViewer);
    }

    return { canCreate, canEdit, canDelete, isViewer, isEditor, isAdmin, noPermMsg };
}
