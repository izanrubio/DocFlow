import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
    ArrowLeftIcon,
    CheckBadgeIcon,
    CreditCardIcon,
    SparklesIcon,
    ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import Layout from '../../components/Layout';
import { useBillingUsage } from '../../hooks/useBillingUsage';
import { createCheckout, createPortal } from '../../api/billing';

const PLAN_LABELS = { free: 'Gratuito', pro: 'Profesional', business: 'Business' };
const PLAN_PRICES = { free: '0€', pro: '19€', business: '49€' };

const STATUS_BADGE = {
    active:    'bg-green-100 text-green-700',
    past_due:  'bg-yellow-100 text-yellow-700',
    canceled:  'bg-gray-100 text-gray-600',
};
const STATUS_LABEL = {
    active:   'Activo',
    past_due: 'Pago pendiente',
    canceled: 'Cancelado',
};

function UsageBar({ label, used, limit }) {
    const unlimited = limit === -1;
    const pct = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
    const danger = !unlimited && pct >= 90;
    const warning = !unlimited && pct >= 70 && pct < 90;

    return (
        <div>
            <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">{label}</span>
                <span className={`text-xs ${danger ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                    {unlimited ? `${used} / ∞` : `${used} / ${limit}`}
                </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                {!unlimited && (
                    <div
                        className={`h-full rounded-full transition-all ${danger ? 'bg-red-500' : warning ? 'bg-yellow-500' : 'bg-indigo-500'}`}
                        style={{ width: `${pct}%` }}
                    />
                )}
                {unlimited && <div className="h-full w-full bg-indigo-200 rounded-full" />}
            </div>
        </div>
    );
}

const UPGRADE_PLANS = [
    {
        key: 'pro',
        name: 'Profesional',
        price: '19€/mes',
        features: ['50 documentos/mes', '10 firmantes/doc', '20 plantillas', '1 GB almacenamiento', 'Recordatorios automáticos'],
    },
    {
        key: 'business',
        name: 'Business',
        price: '49€/mes',
        features: ['Documentos ilimitados', 'Firmantes ilimitados', 'Plantillas ilimitadas', '10 GB almacenamiento', 'Soporte prioritario'],
    },
];

export default function Billing() {
    const { data, isLoading } = useBillingUsage();
    const [upgradeModal, setUpgradeModal] = useState(false);
    const [portalError, setPortalError]   = useState(null);

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
                <div className="animate-pulse space-y-4 max-w-2xl">
                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                    <div className="h-40 bg-gray-200 rounded-xl" />
                    <div className="h-40 bg-gray-200 rounded-xl" />
                </div>
            </Layout>
        );
    }

    const plan     = data?.plan ?? 'free';
    const limits   = data?.limits ?? {};
    const usage    = data?.usage ?? {};
    const status   = data?.subscription_status ?? null;
    const periodEnd = data?.current_period_end ?? null;
    const isFree   = plan === 'free';

    return (
        <Layout>
            <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <Link to="/dashboard" className="text-gray-400 hover:text-gray-600">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Facturación</h1>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tu plan actual</h2>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-gray-900">{PLAN_LABELS[plan] ?? plan}</span>
                                {status && (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-600'}`}>
                                        {STATUS_LABEL[status] ?? status}
                                    </span>
                                )}
                            </div>
                            <p className="text-3xl font-extrabold text-indigo-600 mt-1">
                                {PLAN_PRICES[plan] ?? '—'}
                                <span className="text-sm font-normal text-gray-500">/mes</span>
                            </p>
                            {periodEnd && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Próxima renovación: {new Date(periodEnd).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            )}
                        </div>
                        <CheckBadgeIcon className="w-10 h-10 text-indigo-400 shrink-0" />
                    </div>

                    <div className="flex gap-3 mt-5 flex-wrap">
                        {isFree && (
                            <button
                                onClick={() => setUpgradeModal(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <SparklesIcon className="w-4 h-4" />
                                Mejorar plan
                            </button>
                        )}
                        {!isFree && (
                            <button
                                onClick={() => portalMutation.mutate()}
                                disabled={portalMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                            >
                                <CreditCardIcon className="w-4 h-4" />
                                {portalMutation.isPending ? 'Abriendo…' : 'Gestionar facturación'}
                                <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                        )}
                    </div>
                    {portalError && <p className="mt-2 text-sm text-red-600">{portalError}</p>}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-5">Uso este mes</h2>
                    <div className="space-y-5">
                        <UsageBar
                            label="Documentos"
                            used={usage.documents_this_month ?? 0}
                            limit={usage.documents_limit ?? limits.documents_per_month ?? 5}
                        />
                        <UsageBar
                            label="Plantillas"
                            used={usage.templates_count ?? 0}
                            limit={usage.templates_limit ?? limits.templates ?? 3}
                        />
                    </div>

                    {isFree && (
                        <div className="mt-5 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-between gap-4">
                            <p className="text-sm text-indigo-800">
                                Mejora tu plan para aumentar tus límites.
                            </p>
                            <button
                                onClick={() => setUpgradeModal(true)}
                                className="shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                            >
                                Ver planes
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {upgradeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Mejorar plan</h2>
                            <button onClick={() => setUpgradeModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
                        </div>

                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {UPGRADE_PLANS.map((p) => (
                                <div key={p.key} className={`border-2 rounded-xl p-5 flex flex-col ${p.key === 'pro' ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-gray-200'}`}>
                                    {p.key === 'pro' && (
                                        <span className="self-start mb-3 bg-indigo-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                            Más popular
                                        </span>
                                    )}
                                    <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                                    <p className="text-2xl font-extrabold text-indigo-600 mt-1 mb-4">{p.price}</p>
                                    <ul className="space-y-1.5 flex-1 mb-5">
                                        {p.features.map((f) => (
                                            <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                                                <span className="w-4 h-4 flex-shrink-0 text-indigo-500">✓</span>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => checkoutMutation.mutate(p.key)}
                                        disabled={checkoutMutation.isPending}
                                        className={`w-full py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${p.key === 'pro' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {checkoutMutation.isPending ? 'Redirigiendo…' : 'Elegir plan'}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {checkoutMutation.isError && (
                            <p className="px-6 pb-4 text-sm text-red-600">
                                {checkoutMutation.error?.response?.data?.message ?? 'Error al iniciar el pago.'}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </Layout>
    );
}
