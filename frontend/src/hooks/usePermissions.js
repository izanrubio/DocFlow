import { useAuthStore } from '../store/authStore';

export function usePermissions() {
    const user     = useAuthStore((s) => s.user);
    const role     = user?.role ?? 'viewer';

    const isViewer = role === 'viewer';
    const isEditor = role === 'editor';
    const isAdmin  = role === 'admin';

    const canCreate = !isViewer;
    const canEdit   = !isViewer;
    const canDelete = !isViewer;

    const noPermissionMsg = 'No tienes permisos para realizar esta acción. Contacta con tu administrador.';

    return { canCreate, canEdit, canDelete, isViewer, isEditor, isAdmin, noPermissionMsg };
}
