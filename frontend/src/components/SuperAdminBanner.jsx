export default function SuperAdminBanner() {
    return (
        <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium mb-6"
            style={{ background: '#1e1b4b', color: '#c7d2fe' }}
        >
            <span>⚙️</span>
            <span>Modo Super Admin — Estás viendo datos de todos los tenants</span>
        </div>
    );
}
