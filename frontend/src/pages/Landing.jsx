import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    DocumentTextIcon,
    UserGroupIcon,
    BellAlertIcon,
    ShieldCheckIcon,
    ArrowsRightLeftIcon,
    BuildingOfficeIcon,
    Bars3Icon,
    XMarkIcon,
    ArrowDownTrayIcon,
    CheckCircleIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid, CheckIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../hooks/useAuth';

/* ─── hooks ────────────────────────────────────────────────────────────── */

function useScrolled(threshold = 20) {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handle = () => setScrolled(window.scrollY > threshold);
        window.addEventListener('scroll', handle, { passive: true });
        return () => window.removeEventListener('scroll', handle);
    }, [threshold]);
    return scrolled;
}

function useInView(threshold = 0.15) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, inView];
}

/* ─── animation wrapper ─────────────────────────────────────────────────── */

function Reveal({ children, className = '', delay = 0 }) {
    const [ref, inView] = useInView();
    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
        >
            {children}
        </div>
    );
}

/* ─── Navbar ────────────────────────────────────────────────────────────── */

function Navbar() {
    const scrolled = useScrolled();
    const [open, setOpen] = useState(false);

    return (
        <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
            <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
                <Link to="/" className="font-display text-xl font-bold text-indigo-600 shrink-0">
                    DocFlow
                </Link>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                    <a href="#como-funciona" className="hover:text-indigo-600 transition-colors">Funcionalidades</a>
                    <Link to="/pricing" className="hover:text-indigo-600 transition-colors">Precios</Link>
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    <Link to="/login" className="text-sm font-medium text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                        Iniciar sesión
                    </Link>
                    <Link to="/register" className="text-sm font-medium text-white px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors">
                        Empezar gratis
                    </Link>
                </div>

                <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                    {open ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
                </button>
            </div>

            {open && (
                <div className="md:hidden bg-white border-t border-gray-100 px-5 py-4 space-y-3">
                    <a href="#como-funciona" onClick={() => setOpen(false)} className="block text-sm font-medium text-gray-700 py-2">Funcionalidades</a>
                    <Link to="/pricing" onClick={() => setOpen(false)} className="block text-sm font-medium text-gray-700 py-2">Precios</Link>
                    <div className="pt-2 space-y-2 border-t border-gray-100">
                        <Link to="/login" onClick={() => setOpen(false)} className="block text-center text-sm font-medium text-gray-700 py-2 border border-gray-300 rounded-lg">Iniciar sesión</Link>
                        <Link to="/register" onClick={() => setOpen(false)} className="block text-center text-sm font-medium text-white py-2 bg-indigo-600 rounded-lg">Empezar gratis</Link>
                    </div>
                </div>
            )}
        </header>
    );
}

/* ─── Hero mockup ───────────────────────────────────────────────────────── */

function AppMockup() {
    return (
        <div className="relative select-none">
            <div className="absolute -inset-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl blur-2xl opacity-60" />

            {/* Main card */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-80">
                <div className="bg-indigo-600 px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                    </div>
                    <span className="text-white/90 text-xs font-medium ml-1 font-display">DocFlow</span>
                </div>

                <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="font-display font-semibold text-gray-900 text-sm leading-tight">Contrato de servicios</p>
                            <p className="text-xs text-gray-400 mt-0.5">Acme Corp S.L. · 2 firmantes</p>
                        </div>
                        <span className="shrink-0 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Completado</span>
                    </div>

                    <div className="space-y-2 mb-4">
                        {[
                            { name: 'María González', email: 'maria@empresa.com' },
                            { name: 'Juan Pérez', email: 'juan@acme.es' },
                        ].map((s) => (
                            <div key={s.email} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                    <CheckIcon className="w-3 h-3 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-800 truncate">{s.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{s.email}</p>
                                </div>
                                <span className="text-xs text-green-600 font-medium shrink-0">Firmado</span>
                            </div>
                        ))}
                    </div>

                    <button className="w-full py-2 bg-green-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5">
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                        Descargar PDF firmado
                    </button>
                </div>
            </div>

            {/* Floating secondary card */}
            <div className="absolute -top-5 -right-10 bg-white border border-gray-100 rounded-2xl shadow-xl p-3.5 w-52 z-10">
                <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
                    <p className="text-xs font-semibold text-gray-800 truncate font-display">NDA — TechStartup SL</p>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                    <div className="h-full w-1/2 bg-yellow-400 rounded-full" />
                </div>
                <p className="text-xs text-gray-400">1 de 2 firmantes · Pendiente</p>
            </div>

            {/* Floating notification */}
            <div className="absolute -bottom-4 -left-8 bg-white border border-gray-100 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 z-10">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <CheckCircleSolid className="w-4 h-4 text-green-600" />
                </div>
                <div>
                    <p className="text-xs font-semibold text-gray-800">¡Documento firmado!</p>
                    <p className="text-xs text-gray-400">PDF sellado listo para descargar</p>
                </div>
            </div>
        </div>
    );
}

/* ─── Hero ──────────────────────────────────────────────────────────────── */

function Hero() {
    return (
        <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.08),transparent_60%)]" />

            <div className="relative max-w-6xl mx-auto px-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-indigo-100">
                            <CheckCircleSolid className="w-3.5 h-3.5" />
                            Sin tarjeta de crédito · Gratis para siempre
                        </div>

                        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
                            Firma documentos<br />
                            <span className="text-indigo-600">en minutos,</span><br />
                            no en días
                        </h1>

                        <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
                            DocFlow es la forma más sencilla de enviar, firmar y gestionar contratos para autónomos y pymes españolas.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 text-sm"
                            >
                                <SparklesIcon className="w-4 h-4" />
                                Empezar gratis
                            </Link>
                            <a
                                href="#como-funciona"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                            >
                                Ver cómo funciona
                            </a>
                        </div>

                        <div className="mt-8 flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-green-500" /> Sin instalación</span>
                            <span className="flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-green-500" /> GDPR compliant</span>
                            <span className="flex items-center gap-1.5"><CheckIcon className="w-4 h-4 text-green-500" /> Validez legal UE</span>
                        </div>
                    </div>

                    <div className="flex justify-center lg:justify-end pr-12">
                        <AppMockup />
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ─── Trust logos ───────────────────────────────────────────────────────── */

const TRUST_COMPANIES = [
    { name: 'Nexo Legal', initials: 'NL', color: 'bg-blue-600' },
    { name: 'Grupo Altea', initials: 'GA', color: 'bg-slate-700' },
    { name: 'Meridian Tech', initials: 'MT', color: 'bg-violet-600' },
    { name: 'Solera & Co', initials: 'SC', color: 'bg-teal-600' },
    { name: 'Forja Digital', initials: 'FD', color: 'bg-orange-500' },
];

function TrustLogos() {
    const [ref, inView] = useInView();
    return (
        <section ref={ref} className={`py-12 border-y border-gray-100 bg-gray-50 transition-all duration-700 ${inView ? 'opacity-100' : 'opacity-0'}`}>
            <div className="max-w-5xl mx-auto px-5">
                <p className="text-center text-sm font-medium text-gray-400 mb-8 uppercase tracking-widest">Usado por equipos de todo tipo</p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                    {TRUST_COMPANIES.map((c) => (
                        <div key={c.name} className="flex items-center gap-2.5 text-gray-500">
                            <div className={`w-8 h-8 rounded-lg ${c.color} flex items-center justify-center`}>
                                <span className="text-white text-xs font-bold">{c.initials}</span>
                            </div>
                            <span className="font-display font-semibold text-sm">{c.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── How it works ──────────────────────────────────────────────────────── */

const STEPS = [
    {
        n: '01',
        title: 'Sube tu documento',
        desc: 'Arrastra cualquier PDF o crea uno desde nuestras plantillas prediseñadas en segundos.',
        Icon: DocumentTextIcon,
        color: 'bg-indigo-100 text-indigo-600',
    },
    {
        n: '02',
        title: 'Añade los firmantes',
        desc: 'Introduce el email de cada firmante y define el orden de firma. Nosotros nos encargamos del resto.',
        Icon: UserGroupIcon,
        color: 'bg-purple-100 text-purple-600',
    },
    {
        n: '03',
        title: 'Recibe el contrato firmado',
        desc: 'Cuando todos firmen, recibirás el PDF sellado con certificado de auditoría incluido.',
        Icon: CheckCircleIcon,
        color: 'bg-green-100 text-green-600',
    },
];

function HowItWorks() {
    return (
        <section id="como-funciona" className="py-24 bg-white">
            <div className="max-w-6xl mx-auto px-5">
                <Reveal className="text-center mb-16">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tan sencillo como 1, 2, 3</h2>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">Sin curva de aprendizaje. Empieza a firmar contratos hoy mismo.</p>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200" />

                    {STEPS.map((step, i) => (
                        <Reveal key={step.n} delay={i * 120}>
                            <div className="relative text-center flex flex-col items-center">
                                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-5 relative z-10`}>
                                    <step.Icon className="w-7 h-7" />
                                </div>
                                <span className="font-display text-xs font-bold text-gray-300 tracking-widest mb-2">{step.n}</span>
                                <h3 className="font-display text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{step.desc}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── Features ──────────────────────────────────────────────────────────── */

const FEATURES = [
    { Icon: ShieldCheckIcon,    title: 'Firma electrónica legal',   desc: 'Firmas con validez legal en España y la UE según el Reglamento eIDAS.', color: 'text-indigo-600 bg-indigo-50' },
    { Icon: DocumentTextIcon,   title: 'Plantillas inteligentes',   desc: 'NDA, contratos de servicios y arrendamiento listos para usar con variables dinámicas.', color: 'text-purple-600 bg-purple-50' },
    { Icon: BellAlertIcon,      title: 'Recordatorios automáticos', desc: 'Nunca pierdas el seguimiento de una firma pendiente. Enviamos recordatorios por ti.', color: 'text-blue-600 bg-blue-50' },
    { Icon: SparklesIcon,       title: 'PDF sellado',               desc: 'Cada documento firmado incluye un certificado de auditoría con trazabilidad completa.', color: 'text-green-600 bg-green-50' },
    { Icon: ArrowsRightLeftIcon,title: 'Orden de firma',            desc: 'Controla quién firma primero y en qué orden. Los firmantes reciben el aviso por turno.', color: 'text-orange-600 bg-orange-50' },
    { Icon: BuildingOfficeIcon, title: 'Multi-empresa',             desc: 'Gestiona contratos de distintas empresas desde una sola cuenta centralizada.', color: 'text-teal-600 bg-teal-50' },
];

function Features() {
    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-6xl mx-auto px-5">
                <Reveal className="text-center mb-16">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">Todo lo que necesitas para gestionar contratos</h2>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">Potente para empresas, sencillo para autónomos.</p>
                </Reveal>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map((f, i) => (
                        <Reveal key={f.title} delay={i * 80}>
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all duration-200 group">
                                <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                                    <f.Icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-display font-bold text-gray-900 mb-2">{f.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── Testimonials ──────────────────────────────────────────────────────── */

const TESTIMONIALS = [
    {
        text: 'Antes tardaba días en conseguir que mis clientes firmaran contratos. Con DocFlow lo resuelvo en minutos. Imprescindible.',
        name: 'Laura M.',
        role: 'Diseñadora freelance',
        initials: 'LM',
        color: 'bg-pink-500',
    },
    {
        text: 'Lo usamos para todos los contratos de nuestro equipo. La función de plantillas nos ahorra muchísimo tiempo cada semana.',
        name: 'Carlos R.',
        role: 'CEO de startup',
        initials: 'CR',
        color: 'bg-indigo-500',
    },
    {
        text: 'El PDF sellado con certificado de auditoría nos da la tranquilidad que necesitamos para nuestros acuerdos comerciales.',
        name: 'Ana P.',
        role: 'Directora de operaciones',
        initials: 'AP',
        color: 'bg-teal-500',
    },
];

function Stars() {
    return (
        <div className="flex gap-0.5 mb-4">
            {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

function Testimonials() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-6xl mx-auto px-5">
                <Reveal className="text-center mb-16">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">Lo que dicen nuestros clientes</h2>
                    <p className="text-gray-500 text-lg">Miles de autónomos y pymes ya confían en DocFlow.</p>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TESTIMONIALS.map((t, i) => (
                        <Reveal key={t.name} delay={i * 100}>
                            <div className="bg-slate-50 rounded-2xl p-6 border border-gray-100 flex flex-col h-full">
                                <Stars />
                                <p className="text-gray-700 text-sm leading-relaxed flex-1 mb-6">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center shrink-0`}>
                                        <span className="text-white text-xs font-bold">{t.initials}</span>
                                    </div>
                                    <div>
                                        <p className="font-display font-semibold text-gray-900 text-sm">{t.name}</p>
                                        <p className="text-gray-400 text-xs">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── Pricing section ───────────────────────────────────────────────────── */

const PLANS = [
    {
        key: 'free', name: 'Gratuito', price: 0, badge: null,
        color: 'border-gray-200', btnClass: 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50',
        btnLabel: 'Empezar gratis', btnTo: '/register',
        features: ['5 documentos/mes', '2 firmantes por documento', '3 plantillas', '100 MB almacenamiento', 'Firma electrónica', 'Sellado PDF'],
    },
    {
        key: 'pro', name: 'Profesional', price: 19, badge: 'Más popular',
        color: 'border-indigo-500 ring-2 ring-indigo-500', btnClass: 'bg-indigo-600 text-white hover:bg-indigo-700',
        btnLabel: 'Empezar ahora', btnTo: '/register',
        features: ['50 documentos/mes', '10 firmantes por documento', '20 plantillas', '1 GB almacenamiento', 'Firma electrónica', 'Sellado PDF', 'Recordatorios automáticos', 'Plantillas con variables'],
    },
    {
        key: 'business', name: 'Business', price: 49, badge: null,
        color: 'border-gray-200', btnClass: 'border border-gray-400 text-gray-700 hover:bg-gray-50',
        btnLabel: 'Contactar', btnHref: 'mailto:hello@docflow.es',
        features: ['Documentos ilimitados', 'Firmantes ilimitados', 'Plantillas ilimitadas', '10 GB almacenamiento', 'Firma electrónica', 'Sellado PDF', 'Recordatorios automáticos', 'Plantillas con variables', 'Soporte prioritario'],
    },
];

function PricingSection() {
    return (
        <section id="precios" className="py-24 bg-slate-50">
            <div className="max-w-6xl mx-auto px-5">
                <Reveal className="text-center mb-16">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">Precios claros, sin sorpresas</h2>
                    <p className="text-gray-500 text-lg">Empieza gratis. Escala cuando lo necesites.</p>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {PLANS.map((plan, i) => (
                        <Reveal key={plan.key} delay={i * 100}>
                            <div className={`bg-white rounded-2xl border-2 p-7 flex flex-col relative h-full ${plan.color}`}>
                                {plan.badge && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                        <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">{plan.badge}</span>
                                    </div>
                                )}
                                <div className="mb-5">
                                    <h3 className="font-display text-xl font-bold text-gray-900">{plan.name}</h3>
                                    <div className="mt-2 flex items-end gap-1">
                                        <span className="font-display text-4xl font-extrabold text-gray-900">{plan.price}€</span>
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
                                    <a href={plan.btnHref} className={`w-full text-center py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors ${plan.btnClass}`}>
                                        {plan.btnLabel}
                                    </a>
                                ) : (
                                    <Link to={plan.btnTo} className={`w-full text-center py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors ${plan.btnClass}`}>
                                        {plan.btnLabel}
                                    </Link>
                                )}
                            </div>
                        </Reveal>
                    ))}
                </div>

                <Reveal className="text-center mt-8">
                    <Link to="/pricing" className="text-sm text-indigo-600 hover:underline font-medium">
                        Ver todos los detalles →
                    </Link>
                    <p className="text-xs text-gray-400 mt-2">Precios sin IVA · Facturación mensual · Cancela cuando quieras</p>
                </Reveal>
            </div>
        </section>
    );
}

/* ─── Final CTA ─────────────────────────────────────────────────────────── */

function FinalCTA() {
    return (
        <section className="py-24 bg-indigo-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07),transparent_70%)]" />
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-500 opacity-30 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-purple-500 opacity-30 blur-3xl" />

            <div className="relative max-w-3xl mx-auto px-5 text-center">
                <Reveal>
                    <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
                        ¿Listo para simplificar<br />tus contratos?
                    </h2>
                    <p className="text-indigo-200 text-lg mb-10">
                        Únete a DocFlow hoy. Es gratis para empezar.
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-xl text-base"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        Crear cuenta gratis
                    </Link>
                    <p className="text-indigo-300 text-xs mt-5">Sin tarjeta de crédito · Cancela cuando quieras</p>
                </Reveal>
            </div>
        </section>
    );
}

/* ─── Footer ────────────────────────────────────────────────────────────── */

function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 py-12">
            <div className="max-w-6xl mx-auto px-5">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <span className="font-display text-xl font-bold text-white">DocFlow</span>

                    <nav className="flex flex-wrap justify-center gap-6 text-sm">
                        <Link to="/pricing" className="hover:text-white transition-colors">Precios</Link>
                        <Link to="/login" className="hover:text-white transition-colors">Iniciar sesión</Link>
                        <Link to="/register" className="hover:text-white transition-colors">Crear cuenta</Link>
                    </nav>

                    <div className="text-sm text-center md:text-right">
                        <p>© 2026 DocFlow. Todos los derechos reservados.</p>
                        <p className="mt-1">Hecho con ❤️ en España</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */

export default function Landing() {
    const { user } = useAuth();
    const navigate  = useNavigate();

    useEffect(() => {
        if (user) navigate('/dashboard', { replace: true });
    }, [user, navigate]);

    return (
        <div className="min-h-screen">
            <Navbar />
            <Hero />
            <TrustLogos />
            <HowItWorks />
            <Features />
            <Testimonials />
            <PricingSection />
            <FinalCTA />
            <Footer />
        </div>
    );
}
