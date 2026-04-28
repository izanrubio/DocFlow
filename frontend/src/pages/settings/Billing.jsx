import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    CreditCardIcon,
    BoltIcon,
    ArrowTopRightOnSquareIcon,
    ExclamationTriangleIcon,
    CheckBadgeIcon,
    DocumentTextIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import Layout from '../../components/Layout';
import { useBillingUsage } from '../../hooks/useBillingUsage';
import { createCheckout, createPortal, devSetPlan, getInvoices } from '../../api/billing';

const PLAN_LABELS = { free: 'Gratuito', pro: 'Profesional', business: 'Business' };
const PLAN_PRICES = { free: '0€', pro: '19€', business: '49€' };

const STATUS_META = {
    active:   { label: 'Activo',           bg: '#dcfce7', color: '#15803d' },
    past_due: { label: 'Pago pendiente',   bg: '#fef9c3', color: '#a16207' },
    canceled: { label: 'Cancelado',        bg: '#f3f4f6', color: '#6b7280' },
};

const DEV_PLAN_STYLE = {
    free:     { bg: '#374151', hover: '#4b5563', label: 'Free'     },
    pro:      { bg: '#4f46e5', hover: '#4338ca', label: 'Pro'      },
    business: { bg: '#7c3aed', hover: '#6d28d9', label: 'Business' },
};

const UPGRADE_PLANS = [
    {
        key: 'pro',
        name: 'Profesional',
        price: '19€',
        period: '/mes',
        popular: true,
        features: ['50 documentos/mes', '10 firmantes/doc', '20 plantillas', '1 GB almacenamiento', 'Recordatorios automáticos'],
    },
    {
        key: 'business',
        name: 'Business',
        price: '49€',
        period: '/mes',
        popular: false,
        features: ['Documentos ilimitados', 'Firmantes ilimitados', 'Plantillas ilimitadas', '10 GB almacenamiento', 'Soporte prioritario'],
    },
];

function UsageBar({ label, used, limit }) {
    const unlimited = limit === -1;
    const pct       = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
    const barColor  = unlimited ? '#a5b4fc' : pct >= 90 ? '#ef4444' : pct >= 60 ? '#f59e0b' : '#6366f1';
    const textColor = !unlimited && pct >= 90 ? '#dc2626' : '#6b7280';

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">{label}</span>
                <span className="text-sm font-semibold tabular-nums" style={{ color: textColor }}>
                    {unlimited ? `${used} / ∞` : `${used} / ${limit}`}
                </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: unlimited ? '100%' : `${pct}%`, background: barColor }}
                />
            </div>
        </div>
    );
}

const STATUS_INVOICE = {
    paid:           { label: 'Pagada',    bg: '#dcfce7', color: '#15803d' },
    open:           { label: 'Pendiente', bg: '#fef9c3', color: '#a16207' },
    void:           { label: 'Cancelada', bg: '#f3f4f6', color: '#6b7280' },
    uncollectible:  { label: 'Impagada',  bg: '#fee2e2', color: '#b91c1c' },
};

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatAmount(amount, currency) {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency.toUpperCase() }).format(amount);
}

function InvoicesSection({ invoices, isLoading }) {
    const invoiceList = invoices ?? [];

    return (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-800">Historial de facturas</h2>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-10">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : invoiceList.length === 0 ? (
                <div className="px-6 py-10 text-center">
                    <DocumentTextIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-500">Aún no tienes facturas</p>
                    <p className="text-xs text-gray-400 mt-1">Aparecerán aquí cuando actualices tu plan.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                <th className="px-6 py-3 text-left">Fecha</th>
                                <th className="px-4 py-3 text-left">Nº factura</th>
                                <th className="px-4 py-3 text-right">Importe</th>
                                <th className="px-4 py-3 text-left">Estado</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {invoiceList.map((inv) => {
                                const s = STATUS_INVOICE[inv.status] ?? STATUS_INVOICE.void;
                                return (
                                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3.5 text-gray-700 whitespace-nowrap">
                                            {formatDate(inv.date)}
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">
                                            {inv.number ?? inv.id}
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-800 font-semibold text-right whitespace-nowrap">
                                            {formatAmount(inv.amount, inv.currency)}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span
                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                                                style={{ background: s.bg, color: s.color }}
                                            >
                                                {s.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center justify-end gap-2">
                                                {inv.hosted_url && (
                                                    <a
                                                        href={inv.hosted_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                                                    >
                                                        <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                                                        Ver
                                                    </a>
                                                )}
                                                {inv.pdf_url && (
                                                    <a
                                                        href={inv.pdf_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <ArrowDownTrayIcon className="w-3 h-3" />
                                                        PDF
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default function Billing() {
    const { data, isLoading, refetch } = useBillingUsage();
    const [upgradeModal, setUpgradeModal] = useState(false);
    const [portalError, setPortalError]   = useState(null);

    const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
        queryKey: ['invoices'],
        queryFn:  () => getInvoices().then((r) => r.data.data),
    });

    const devPlanMutation = useMutation({
        mutationFn: (plan) => devSetPlan(plan),
        onSuccess:  () => refetch(),
    });

    const checkoutMutation = useMutation({
        mutationFn: (plan) => createCheckout(plan).then((r) => r.data.data.checkout_url),
        onSuccess:  (url) => { window.location.href = url; },
    });

    const portalMutation = useMutation({
        mutationFn: () => createPortal().then((r) => r.data.data.portal_url),
        onSuccess:  (url) => { window.open(url, '_blank'); },
        onError:    (err) => setPortalError(err.response?.data?.message ?? 'Error al abrir el portal.'),
    });

    if (isLoading) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </Layout>
        );
    }

    const plan      = data?.plan ?? 'free';
    const limits    = data?.limits ?? {};
    const usage     = data?.usage ?? {};
    const status    = data?.subscription_status ?? null;
    const periodEnd = data?.current_period_end ?? null;
    const isFree    = plan === 'free';

    const docsUsed  = usage.documents_this_month ?? 0;
    const docsLimit = usage.documents_limit ?? limits.documents_per_month ?? 5;
    const tplUsed   = usage.templates_count ?? 0;
    const tplLimit  = usage.templates_limit ?? limits.templates ?? 3;
    const docsPct   = docsLimit === -1 ? 0 : Math.round((docsUsed / docsLimit) * 100);
    const showWarning = docsLimit !== -1 && docsPct >= 80;

    const statusMeta = status ? (STATUS_META[status] ?? null) : null;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-1">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>
                </div>

                {/* ── Dos columnas en desktop ──────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">

                {/* ── Plan actual ─────────────────────────────────── */}
                <div
                    className="rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_-4px_rgba(0,0,0,0.1)]"
                    style={{ background: 'linear-gradient(135deg, #f0f0ff 0%, #ffffff 60%)' }}
                >
                    <div className="flex items-start justify-between gap-4 mb-5">
                        <div>
                            <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-widest mb-2">
                                Tu plan actual
                            </p>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="text-2xl font-bold text-gray-900">{PLAN_LABELS[plan] ?? plan}</span>
                                {statusMeta && (
                                    <span
                                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                        style={{ background: statusMeta.bg, color: statusMeta.color }}
                                    >
                                        <CheckCircleIcon className="w-3 h-3" />
                                        {statusMeta.label}
                                    </span>
                                )}
                                {isFree && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                        <CheckCircleIcon className="w-3 h-3" />
                                        Activo
                                    </span>
                                )}
                            </div>
                            <p className="mt-1.5">
                                <span className="text-4xl font-extrabold text-indigo-600">{PLAN_PRICES[plan] ?? '—'}</span>
                                <span className="text-sm font-normal text-gray-400 ml-1">/mes</span>
                            </p>
                            {periodEnd && (
                                <p className="text-xs text-gray-400 mt-1.5">
                                    Próxima renovación: {new Date(periodEnd).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            )}
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                            <CheckBadgeIcon className="w-6 h-6 text-indigo-500" />
                        </div>
                    </div>

                    <div className="border-t border-indigo-100 pt-5 flex gap-3 flex-wrap">
                        {isFree && (
                            <button
                                onClick={() => setUpgradeModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.98]"
                                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
                            >
                                <BoltIcon className="w-4 h-4" />
                                Mejorar plan
                            </button>
                        )}
                        {!isFree && (
                            <button
                                onClick={() => portalMutation.mutate()}
                                disabled={portalMutation.isPending}
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
                            >
                                <CreditCardIcon className="w-4 h-4 text-gray-400" />
                                {portalMutation.isPending ? 'Abriendo…' : 'Gestionar facturación'}
                                <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                        )}
                    </div>
                    {portalError && <p className="mt-3 text-sm text-red-600">{portalError}</p>}
                </div>

                {/* ── Uso este mes ────────────────────────────────── */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_-4px_rgba(0,0,0,0.08)]">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-5">
                        Uso este mes
                    </p>
                    <div className="space-y-5">
                        <UsageBar label="Documentos" used={docsUsed}  limit={docsLimit} />
                        <UsageBar label="Plantillas"  used={tplUsed}   limit={tplLimit}  />
                    </div>

                    {/* Banner de aviso — solo si uso >= 80% */}
                    {showWarning && (
                        <div className="mt-5 flex items-start gap-3 p-4 rounded-xl" style={{ background: '#fefce8', border: '1px solid #fde68a' }}>
                            <ExclamationTriangleIcon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#d97706' }} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold" style={{ color: '#92400e' }}>
                                    {docsPct >= 100 ? 'Has alcanzado el límite de tu plan' : 'Estás cerca del límite'}
                                </p>
                                <p className="text-xs mt-0.5" style={{ color: '#a16207' }}>
                                    Has usado {docsUsed} de {docsLimit} documentos este mes.
                                    {isFree && ' Mejora tu plan para continuar.'}
                                </p>
                            </div>
                            {isFree && (
                                <button
                                    onClick={() => setUpgradeModal(true)}
                                    className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                                    style={{ background: '#f59e0b', color: '#ffffff' }}
                                >
                                    Mejorar
                                </button>
                            )}
                        </div>
                    )}
                </div>

                </div>{/* end grid */}

                {/* ── Historial de facturas ───────────────────────── */}
                <InvoicesSection invoices={invoicesData} isLoading={invoicesLoading} />

                {/* ── [DEV] panel ─────────────────────────────────── */}
                {import.meta.env.DEV && (
                    <div className="rounded-2xl border border-gray-700 overflow-hidden" style={{ background: '#111827' }}>
                        <div className="px-5 py-3 border-b border-gray-700">
                            <p className="text-xs font-mono font-bold text-gray-400">
                                [DEV] <span className="text-gray-500 font-normal">Entorno de desarrollo · Cambiar plan</span>
                            </p>
                        </div>
                        <div className="p-4 flex gap-2 flex-wrap">
                            {['free', 'pro', 'business'].map((p) => {
                                const s = DEV_PLAN_STYLE[p];
                                const isActive = plan === p;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => devPlanMutation.mutate(p)}
                                        disabled={devPlanMutation.isPending || isActive}
                                        className="px-4 py-1.5 text-xs font-mono font-semibold rounded-lg text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                                        style={{
                                            background: isActive ? s.bg : `${s.bg}99`,
                                            outline: isActive ? `2px solid ${s.bg}` : 'none',
                                            outlineOffset: 2,
                                        }}
                                    >
                                        {s.label}
                                        {isActive && ' ✓'}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Modal mejorar plan ───────────────────────────────── */}
            {upgradeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Mejorar plan</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Elige el plan que mejor se adapta a tus necesidades.</p>
                            </div>
                            <button
                                onClick={() => setUpgradeModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {UPGRADE_PLANS.map((p) => (
                                <div
                                    key={p.key}
                                    className="relative rounded-2xl p-5 flex flex-col border-2 transition-all"
                                    style={p.popular
                                        ? { borderColor: '#6366f1', boxShadow: '0 0 0 3px rgba(99,102,241,0.15)' }
                                        : { borderColor: '#e5e7eb' }
                                    }
                                >
                                    {p.popular && (
                                        <span
                                            className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs font-bold text-white rounded-full"
                                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                                        >
                                            Más popular
                                        </span>
                                    )}
                                    <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                                    <p className="mt-1 mb-4">
                                        <span className="text-3xl font-extrabold text-indigo-600">{p.price}</span>
                                        <span className="text-sm text-gray-400">{p.period}</span>
                                    </p>
                                    <ul className="space-y-2 flex-1 mb-5">
                                        {p.features.map((f) => (
                                            <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                                                <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 text-[10px] font-bold">✓</span>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => checkoutMutation.mutate(p.key)}
                                        disabled={checkoutMutation.isPending}
                                        className="w-full py-2.5 text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
                                        style={p.popular
                                            ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }
                                            : { background: '#fff', color: '#374151', border: '1.5px solid #e5e7eb' }
                                        }
                                    >
                                        {checkoutMutation.isPending ? 'Redirigiendo…' : 'Elegir plan'}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {checkoutMutation.isError && (
                            <p className="px-6 pb-5 text-sm text-red-600">
                                {checkoutMutation.error?.response?.data?.message ?? 'Error al iniciar el pago.'}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </Layout>
    );
}
