import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { XMarkIcon, PlusIcon, TrashIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { updateTemplateVariables } from '../api/templates';
import { useToast } from '../context/ToastContext';

const KEY_REGEX = /^[a-z][a-z0-9_]*$/;

const TYPE_OPTIONS = [
    { value: 'text',     label: 'Texto' },
    { value: 'number',   label: 'Número' },
    { value: 'date',     label: 'Fecha' },
    { value: 'textarea', label: 'Texto largo' },
];

const emptyRow = () => ({ key: '', label: '', type: 'text', required: true, _id: Math.random() });

export default function VariablesEditorModal({ template, onClose, onSaved }) {
    const queryClient = useQueryClient();
    const toast       = useToast();

    const [rows, setRows] = useState(
        (template.variables ?? []).length > 0
            ? template.variables.map((v) => ({ ...v, _id: Math.random() }))
            : [emptyRow()]
    );
    const [errors, setErrors] = useState({});

    const setField = (_id, field, value) =>
        setRows((prev) => prev.map((r) => (r._id === _id ? { ...r, [field]: value } : r)));

    const addRow = () => setRows((prev) => [...prev, emptyRow()]);

    const removeRow = (_id) => setRows((prev) => prev.filter((r) => r._id !== _id));

    const mutation = useMutation({
        mutationFn: () => {
            const variables = rows
                .filter((r) => r.key.trim())
                .map(({ _id, ...rest }) => ({ ...rest, key: rest.key.trim().toLowerCase() }));
            return updateTemplateVariables(template.id, variables);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            toast.success('Variables guardadas correctamente.');
            onSaved?.();
            onClose();
        },
        onError: (err) => {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors ?? {});
            } else {
                toast.error('Error al guardar las variables.');
            }
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const localErrors = {};

        rows.forEach((r, i) => {
            if (!r.key.trim()) { localErrors[`rows.${i}.key`] = 'Requerido'; return; }
            if (!KEY_REGEX.test(r.key.trim())) localErrors[`rows.${i}.key`] = 'Solo minúsculas, números y _';
            if (!r.label.trim()) localErrors[`rows.${i}.label`] = 'Requerido';
        });

        const keys = rows.map((r) => r.key.trim().toLowerCase()).filter(Boolean);
        if (keys.length !== new Set(keys).size) {
            localErrors['_global'] = 'Las claves deben ser únicas.';
        }

        setErrors(localErrors);
        if (Object.keys(localErrors).length) return;

        mutation.mutate();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Variables de plantilla</h2>
                        <p className="text-sm text-gray-500 mt-0.5">«{template.name}»</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 pt-4 shrink-0">
                    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <InformationCircleIcon className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-700">
                            Usa <code className="bg-blue-100 px-1 rounded font-mono">{`{{nombre_variable}}`}</code> en tu PDF para marcar los campos que se rellenarán al crear un documento.
                        </p>
                    </div>
                </div>

                <form id="vars-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-3">
                    {errors['_global'] && (
                        <p className="text-sm text-red-600">{errors['_global']}</p>
                    )}

                    <div className="grid grid-cols-[1fr_1fr_120px_80px_32px] gap-2 px-1">
                        <span className="text-xs font-medium text-gray-500">Clave</span>
                        <span className="text-xs font-medium text-gray-500">Etiqueta</span>
                        <span className="text-xs font-medium text-gray-500">Tipo</span>
                        <span className="text-xs font-medium text-gray-500">Obligatorio</span>
                        <span />
                    </div>

                    {rows.map((row, i) => (
                        <div key={row._id} className="grid grid-cols-[1fr_1fr_120px_80px_32px] gap-2 items-start">
                            <div>
                                <input
                                    type="text"
                                    value={row.key}
                                    onChange={(e) => setField(row._id, 'key', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    placeholder="clave_var"
                                    className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono ${errors[`rows.${i}.key`] ? 'border-red-400' : 'border-gray-300'}`}
                                />
                                {errors[`rows.${i}.key`] && (
                                    <p className="text-xs text-red-600 mt-0.5">{errors[`rows.${i}.key`]}</p>
                                )}
                            </div>
                            <div>
                                <input
                                    type="text"
                                    value={row.label}
                                    onChange={(e) => setField(row._id, 'label', e.target.value)}
                                    placeholder="Nombre visible"
                                    className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors[`rows.${i}.label`] ? 'border-red-400' : 'border-gray-300'}`}
                                />
                                {errors[`rows.${i}.label`] && (
                                    <p className="text-xs text-red-600 mt-0.5">{errors[`rows.${i}.label`]}</p>
                                )}
                            </div>
                            <select
                                value={row.type}
                                onChange={(e) => setField(row._id, 'type', e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {TYPE_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                            <div className="flex items-center justify-center pt-1.5">
                                <input
                                    type="checkbox"
                                    checked={row.required}
                                    onChange={(e) => setField(row._id, 'required', e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeRow(row._id)}
                                disabled={rows.length === 1}
                                className="mt-1 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded disabled:opacity-30"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    <button type="button" onClick={addRow}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors">
                        <PlusIcon className="w-4 h-4" />
                        Añadir variable
                    </button>
                </form>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
                    {mutation.isError && !Object.keys(errors).length && (
                        <p className="text-sm text-red-600 mr-auto">
                            {mutation.error?.response?.data?.message ?? 'Error al guardar.'}
                        </p>
                    )}
                    <button type="button" onClick={onClose} disabled={mutation.isPending}
                        className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                        Cancelar
                    </button>
                    <button type="submit" form="vars-form" disabled={mutation.isPending}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                        {mutation.isPending ? 'Guardando…' : 'Guardar variables'}
                    </button>
                </div>
            </div>
        </div>
    );
}
