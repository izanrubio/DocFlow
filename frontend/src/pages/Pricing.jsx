import { Link } from 'react-router-dom';
import { CheckIcon } from '@heroicons/react/24/solid';

const PLANS = [
    {
        key:    'free',
        name:   'Gratuito',
        price:  0,
        badge:  null,
        color:  'border-gray-200',
        btnClass: 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50',
        btnLabel: 'Empezar gratis',
        btnTo:  '/register',
        features: [
            '5 documentos/mes',
            '2 firmantes por documento',
            '3 plantillas',
            '100 MB almacenamiento',
            'Firma electrónica',
            'Sellado PDF',
        ],
    },
    {
        key:    'pro',
        name:   'Profesional',
        price:  19,
        badge:  'Más popular',
        color:  'border-indigo-500 ring-2 ring-indigo-500',
        btnClass: 'bg-indigo-600 text-white hover:bg-indigo-700',
        btnLabel: 'Empezar ahora',
        btnTo:  '/register',
        features: [
            '50 documentos/mes',
            '10 firmantes por documento',
            '20 plantillas',
            '1 GB almacenamiento',
            'Firma electrónica',
            'Sellado PDF',
            'Recordatorios automáticos',
            'Plantillas con variables',
        ],
    },
    {
        key:    'business',
        name:   'Business',
        price:  49,
        badge:  null,
        color:  'border-gray-200',
        btnClass: 'border border-gray-400 text-gray-700 hover:bg-gray-50',
        btnLabel: 'Contactar',
        btnHref: 'mailto:hello@docflow.es',
        features: [
            'Documentos ilimitados',
            'Firmantes ilimitados',
            'Plantillas ilimitadas',
            '10 GB almacenamiento',
            'Firma electrónica',
            'Sellado PDF',
            'Recordatorios automáticos',
            'Plantillas con variables',
            'Soporte prioritario',
        ],
    },
];

export default function Pricing() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <Link to="/" className="text-2xl font-bold text-indigo-600 mb-8 inline-block">DocFlow</Link>
                    <h1 className="text-4xl font-bold text-gray-900 mt-2">Elige tu plan</h1>
                    <p className="text-gray-500 mt-3 text-lg">
                        Empieza gratis. Escala cuando lo necesites.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.key}
                            className={`bg-white rounded-2xl border-2 p-7 flex flex-col relative ${plan.color}`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                        {plan.badge}
                                    </span>
                                </div>
                            )}

                            <div className="mb-5">
                                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                                <div className="mt-2 flex items-end gap-1">
                                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}€</span>
                                    <span className="text-gray-500 text-sm mb-1">/mes</span>
                                </div>
                            </div>

                            <ul className="space-y-2.5 flex-1 mb-6">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                                        <CheckIcon className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            {plan.btnHref ? (
                                <a
                                    href={plan.btnHref}
                                    className={`w-full text-center py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${plan.btnClass}`}
                                >
                                    {plan.btnLabel}
                                </a>
                            ) : (
                                <Link
                                    to={plan.btnTo}
                                    className={`w-full text-center py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${plan.btnClass}`}
                                >
                                    {plan.btnLabel}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                <p className="text-center text-xs text-gray-400 mt-8">
                    Precios sin IVA · Facturación mensual · Cancela cuando quieras
                </p>

                <div className="text-center mt-6">
                    <Link to="/login" className="text-sm text-indigo-600 hover:underline">
                        ¿Ya tienes cuenta? Inicia sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}
