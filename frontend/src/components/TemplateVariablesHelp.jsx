import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const LS_KEY = 'docflow_tpl_help_open';

const STEPS = [
    {
        n: 1,
        title: 'Prepara tu documento',
        body: (
            <>
                <p className="text-sm text-indigo-800 mb-2">
                    En tu editor de texto (Word, Google Docs, LibreOffice…) escribe los campos variables con el formato{' '}
                    <code className="bg-indigo-100 px-1 rounded font-mono text-xs">{'{{nombre_variable}}'}</code>.
                    Por ejemplo:
                </p>
                <pre className="bg-white/70 border border-indigo-100 rounded-lg px-4 py-3 text-xs font-mono text-indigo-900 overflow-x-auto leading-relaxed">
{`En {{ciudad}}, a {{fecha_dia}} de {{fecha_mes}} de {{fecha_ano}}

CLIENTE: {{nombre_cliente}}, con DNI {{dni_cliente}}

El importe total será de {{importe_total}} €`}
                </pre>
                <p className="text-xs text-indigo-600 mt-2">
                    Usa nombres descriptivos en minúsculas y sin espacios (puedes usar guiones bajos).
                </p>
            </>
        ),
    },
    {
        n: 2,
        title: 'Exporta a PDF',
        body: (
            <p className="text-sm text-indigo-800">
                Exporta o guarda el documento como <strong>PDF</strong> desde tu editor antes de subirlo.
            </p>
        ),
    },
    {
        n: 3,
        title: 'Sube la plantilla a DocFlow',
        body: (
            <p className="text-sm text-indigo-800">
                Ve a <strong>«Nueva plantilla»</strong>, sube el PDF y DocFlow detectará automáticamente las variables{' '}
                <code className="bg-indigo-100 px-1 rounded font-mono text-xs">{'{{entre_llaves}}'}</code>.
                Verás un resumen con todas las variables encontradas.
            </p>
        ),
    },
    {
        n: 4,
        title: 'Revisa y ajusta las variables',
        body: (
            <>
                <p className="text-sm text-indigo-800 mb-1.5">
                    Pulsa <strong>«Variables»</strong> en tu plantilla para editar cada campo. Puedes:
                </p>
                <ul className="text-sm text-indigo-700 space-y-1 list-none">
                    {[
                        'Cambiar el nombre visible de cada variable (label)',
                        'Cambiar el tipo: Texto, Número, Fecha o Texto largo',
                        'Marcar cuáles son obligatorias',
                        'Añadir variables manualmente si alguna no se detectó',
                    ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                            <span className="mt-0.5 w-4 h-4 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center shrink-0 text-[9px] font-bold">✓</span>
                            {item}
                        </li>
                    ))}
                </ul>
            </>
        ),
    },
    {
        n: 5,
        title: 'Usa la plantilla',
        body: (
            <p className="text-sm text-indigo-800">
                Pulsa <strong>«Usar plantilla»</strong>, rellena el formulario con los datos reales y DocFlow generará
                el documento con todos los campos rellenados, listo para enviar a firmar.
            </p>
        ),
    },
];

const SUGGESTED = [
    { key: 'ciudad',               type: 'Texto'       },
    { key: 'fecha_dia',            type: 'Número'      },
    { key: 'fecha_mes',            type: 'Texto'       },
    { key: 'fecha_ano',            type: 'Número'      },
    { key: 'nombre_cliente',       type: 'Texto'       },
    { key: 'dni_cliente',          type: 'Texto'       },
    { key: 'importe_total',        type: 'Número'      },
    { key: 'descripcion_servicio', type: 'Texto largo' },
];

const TYPE_COLOR = {
    'Texto':       { bg: '#ede9fe', color: '#6d28d9' },
    'Número':      { bg: '#dbeafe', color: '#1d4ed8' },
    'Fecha':       { bg: '#dcfce7', color: '#15803d' },
    'Texto largo': { bg: '#fef3c7', color: '#92400e' },
};

export default function TemplateVariablesHelp() {
    const [open, setOpen] = useState(() => {
        try { return localStorage.getItem(LS_KEY) === 'true'; }
        catch { return false; }
    });

    const toggle = () => {
        const next = !open;
        setOpen(next);
        try { localStorage.setItem(LS_KEY, String(next)); } catch {}
    };

    return (
        <div className="mb-8 rounded-2xl overflow-hidden border border-indigo-100" style={{ background: '#f5f3ff' }}>
            {/* Header — siempre visible */}
            <button
                onClick={toggle}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-indigo-50/60 transition-colors"
            >
                <span className="text-sm font-semibold text-indigo-800">
                    ¿Cómo usar variables en tus plantillas? 💡
                </span>
                {open
                    ? <ChevronUpIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                    : <ChevronDownIcon className="w-4 h-4 text-indigo-400 shrink-0" />}
            </button>

            {/* Cuerpo expandible */}
            {open && (
                <div className="px-5 pb-6 space-y-6 border-t border-indigo-100">

                    {/* Qué son las variables */}
                    <div className="pt-5">
                        <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">¿Qué son las variables?</h3>
                        <p className="text-sm text-indigo-800">
                            Las variables te permiten crear plantillas reutilizables con campos que se rellenan
                            automáticamente cada vez que usas la plantilla. En lugar de editar el PDF manualmente,
                            introduces los datos en un formulario y DocFlow genera el documento personalizado.
                        </p>
                    </div>

                    {/* Pasos */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Pasos</h3>
                        {STEPS.map((step) => (
                            <div key={step.n} className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                    {step.n}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-indigo-900 mb-1.5">{step.title}</p>
                                    {step.body}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Variables sugeridas */}
                    <div>
                        <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">Variables recomendadas</h3>
                        <div className="flex flex-wrap gap-2">
                            {SUGGESTED.map(({ key, type }) => {
                                const tc = TYPE_COLOR[type] ?? TYPE_COLOR['Texto'];
                                return (
                                    <div key={key} className="flex items-center gap-1.5 bg-white border border-indigo-100 rounded-full px-3 py-1">
                                        <code className="text-xs font-mono text-indigo-700">{`{{${key}}}`}</code>
                                        <span className="text-gray-300">→</span>
                                        <span
                                            className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                                            style={{ background: tc.bg, color: tc.color }}
                                        >
                                            {type}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
