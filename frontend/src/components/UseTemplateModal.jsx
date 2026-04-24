import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useTemplate } from '../api/templates';

const PREFIX_LABELS = {
    parte_a:      'Parte A (Divulgante)',
    parte_b:      'Parte B (Receptora)',
    cliente:      'Cliente',
    proveedor:    'Prestador',
    arrendador:   'Arrendador',
    arrendatario: 'Arrendatario',
};

function groupVariables(variables) {
    const groups = {};
    const other  = [];

    for (const v of variables) {
        const prefix = Object.keys(PREFIX_LABELS).find((p) => v.key.startsWith(p + '_'));
        if (prefix) {
            if (!groups[prefix]) groups[prefix] = [];
            groups[prefix].push(v);
        } else {
            other.push(v);
        }
    }

    const result = [];
    if (other.length) result.push({ label: null, fields: other });
    for (const [prefix, fields] of Object.entries(groups)) {
        result.push({ label: PREFIX_LABELS[prefix], fields });
    }
    return result;
}

function FieldInput({ variable, value, onChange, error }) {
    const base = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm';
    const cls  = `${base} ${error ? 'border-red-400' : 'border-gray-300'}`;

    if (variable.type === 'textarea') {
        return (
            <>
                <textarea
                    value={value}
                    onChange={(e) => onChange(variable.key, e.target.value)}
                    rows={3}
                    className={cls}
                    required={variable.required}
                />
                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </>
        );
    }

    return (
        <>
            <input
                type={variable.type === 'number' ? 'number' : variable.type === 'date' ? 'date' : 'text'}
                value={value}
                onChange={(e) => onChange(variable.key, e.target.value)}
                className={cls}
                required={variable.required}
                min={variable.type === 'number' ? '0' : undefined}
                step={variable.type === 'number' ? 'any' : undefined}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </>
    );
}

export default function UseTemplateModal({ template, onClose }) {
    const navigate    = useNavigate();
    const queryClient = useQueryClient();
    const hasVars     = template.has_variables && Array.isArray(template.variables) && template.variables.length > 0;

    const [step, setStep]         = useState(1);
    const [title, setTitle]       = useState(template.name);
    const [expiresAt, setExpiresAt] = useState('');
    const [values, setValues]     = useState(
        Object.fromEntries((template.variables ?? []).map((v) => [v.key, '']))
    );
    const [errors, setErrors]     = useState({});

    const setField = (key, val) => setValues((prev) => ({ ...prev, [key]: val }));

    const mutation = useMutation({
        mutationFn: () => useTemplate(template.id, {
            title,
            expires_at: expiresAt || undefined,
            values: hasVars ? values : undefined,
        }),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            onClose();
            navigate(`/documents/${res.data.data.id}`, {
                state: { successMessage: 'Documento creado. Ahora añade los firmantes.' },
            });
        },
        onError: (err) => {
            if (err.response?.status === 422) {
                const errs = err.response.data.errors ?? {};
                setErrors(errs);
                const hasValuesError = Object.keys(errs).some((k) => k.startsWith('values.'));
                if (hasValuesError && hasVars) setStep(2);
            }
        },
    });

    const footerError = mutation.isError
        ? (Object.keys(errors).length
            ? 'Hay campos obligatorios sin completar. Revísalos arriba.'
            : (mutation.error?.response?.data?.message ?? 'Error al crear el documento.'))
        : null;

    const handleStep1Next = (e) => {
        e.preventDefault();
        if (!title.trim()) { setErrors({ title: ['El título es obligatorio.'] }); return; }
        setErrors({});
        if (hasVars) setStep(2); else mutation.mutate();
    };

    const handleStep2Submit = (e) => {
        e.preventDefault();
        setErrors({});
        mutation.mutate();
    };

    const groups = hasVars ? groupVariables(template.variables) : [];

    const totalSteps = hasVars ? 2 : 1;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Crear documento</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Desde «{template.name}»</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {totalSteps > 1 && (
                            <span className="text-xs text-gray-400 font-medium">
                                Paso {step} de {totalSteps}
                            </span>
                        )}
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {totalSteps > 1 && (
                    <div className="flex px-6 pt-4 gap-2 shrink-0">
                        {[1, 2].map((s) => (
                            <div
                                key={s}
                                className={`flex-1 h-1 rounded-full transition-colors ${
                                    s <= step ? 'bg-indigo-600' : 'bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>
                )}

                <div className="overflow-y-auto flex-1">
                    {step === 1 && (
                        <form id="step1-form" onSubmit={handleStep1Next} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título del documento</label>
                                <input
                                    type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                                    required maxLength={255}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title[0]}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha límite de firma <span className="text-gray-400 font-normal">(opcional)</span>
                                </label>
                                <input
                                    type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                />
                                {errors.expires_at && <p className="mt-1 text-xs text-red-600">{errors.expires_at[0]}</p>}
                            </div>

                        </form>
                    )}

                    {step === 2 && (
                        <form id="step2-form" onSubmit={handleStep2Submit} className="p-6 space-y-6">
                            {groups.map((group, gi) => (
                                <div key={gi}>
                                    {group.label && (
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 pb-1 border-b border-gray-100">
                                            {group.label}
                                        </h3>
                                    )}
                                    <div className="space-y-4">
                                        {group.fields.map((variable) => (
                                            <div key={variable.key}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {variable.label}
                                                    {variable.required && <span className="text-red-500 ml-0.5">*</span>}
                                                </label>
                                                <FieldInput
                                                    variable={variable}
                                                    value={values[variable.key] ?? ''}
                                                    onChange={setField}
                                                    error={errors[`values.${variable.key}`]?.[0]}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                        </form>
                    )}
                </div>

                <div className="flex flex-col gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
                    {footerError && (
                        <p className="text-sm text-red-600 text-center">{footerError}</p>
                    )}
                    {step === 1 ? (
                        <>
                            <button type="button" onClick={onClose} disabled={mutation.isPending}
                                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                                Cancelar
                            </button>
                            <button type="submit" form="step1-form" disabled={mutation.isPending}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                                {hasVars ? (
                                    <>Siguiente <ChevronRightIcon className="w-4 h-4" /></>
                                ) : (
                                    mutation.isPending ? 'Creando…' : 'Crear documento'
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <button type="button" onClick={() => setStep(1)} disabled={mutation.isPending}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                                <ChevronLeftIcon className="w-4 h-4" /> Atrás
                            </button>
                            <button type="submit" form="step2-form" disabled={mutation.isPending}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                                {mutation.isPending ? 'Creando…' : 'Crear documento'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
